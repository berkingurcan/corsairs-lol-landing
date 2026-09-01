/**
 * The mock board.
 *
 * A deterministic 195-country fixture: same seed, same board, every reload.
 * That matters more than it sounds — a board that reshuffles on refresh makes
 * every layout bug look like a data bug, and no two people reviewing a screen
 * are looking at the same screen.
 *
 * It is stateful on purpose. A purchase through this adapter actually moves
 * the country, bumps its price up the curve, writes a flip and shows up in the
 * activity feed, so the end-to-end fake purchase in step 4 is end-to-end.
 *
 * Everything here is fixture data. The wallet addresses are random base58 of
 * the right shape and length; none of them is anybody's.
 */
import { COUNTRIES } from "@/lib/countries";
import { game } from "@/lib/site";

import {
  BoardError,
  BoardNetworkError,
  type BannerDraft,
  type BoardAdapter,
  type BoardState,
  type PurchaseIntent,
  type SettleResponse,
} from "./adapter";
import { LIMITS, MAX_PRICE, fromLamports, toLamports } from "./config";
import { consumeMockFailure } from "./mockFailures";
import { colorForAddress } from "./ownerColor";
import type { FlipRecord, Territory } from "./types";

// ──── Determinism ────

const SEED = 0x63727372; // "crsr"

/** mulberry32. Short, seedable, and good enough to lay out a fixture. */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58(rand: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += BASE58[Math.floor(rand() * BASE58.length)];
  return out;
}

const pick = <T,>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)];

/**
 * The fixture's clock.
 *
 * Fixed rather than `Date.now()`, so "held since" and the activity ordering do
 * not drift between a build and the moment someone opens it — the same reason
 * the board itself is seeded. 1 September 2026, 12:00 UTC.
 */
const NOW = Date.UTC(2026, 8, 1, 12, 0, 0);
const DAY = 86_400_000;

// ──── Banner copy ────
// Written out rather than generated, because generated banner text reads as
// generated and the banner is the one part of this UI whose whole job is to
// look like a person wrote it. Within the real limits: 22 / 120 / 150.

const BANNERS: { title: string; tagline: string; link: string }[] = [
  { title: "Lisbon Outpost", tagline: "Coffee, code and a very small navy. Take it if you think you can hold it.", link: "lisbon.example" },
  { title: "The Long Watch", tagline: "Bought at the bottom. Selling at whatever you feel like paying.", link: "" },
  { title: "Northern Fleet", tagline: "Third time holding this one. It keeps coming back.", link: "fleet.example" },
  { title: "Salt & Rope", tagline: "A small trading house. We fix things and we keep the lights on.", link: "saltandrope.example" },
  { title: "Anchor Point", tagline: "", link: "anchor.example" },
  { title: "Cartographers", tagline: "We draw the maps. Somebody has to.", link: "" },
  { title: "Dead Reckoning", tagline: "No instruments, no excuses. Still here.", link: "deadreckoning.example" },
  { title: "The Quiet Port", tagline: "Nothing happens here and that is the point.", link: "" },
  { title: "Signal Flag", tagline: "Hiring. Two roles, both remote, both real.", link: "signalflag.example/jobs" },
  { title: "Harbour Light", tagline: "Held since the first week. Not selling cheap.", link: "" },
  { title: "Windward", tagline: "Come and take it.", link: "" },
  { title: "The Tin Compass", tagline: "A newsletter about maps, ships and bad decisions. Weekly, free.", link: "tincompass.example" },
  { title: "Low Tide Co.", tagline: "Buying countries so I do not have to buy anything else.", link: "" },
  { title: "Meridian", tagline: "Somewhere between where I started and where I am going.", link: "meridian.example" },
];

// ──── Fixture ────

/** Price after `flips` takeovers, in lamports, up the 1.20x curve. */
function priceAfterFlips(flips: number): number {
  let lamports = toLamports(game.basePrice);
  for (let i = 1; i < flips; i++) lamports = Math.round(lamports * game.priceMultiplier);
  return lamports;
}

type MockTerritory = Territory & { updatedAt: number };

interface MockBoard {
  territories: Map<string, MockTerritory>;
  flips: FlipRecord[];
}

let board: MockBoard | null = null;

/**
 * The wallet the mock wallet provider connects as.
 *
 * It holds real countries in the fixture, so Holdings has something in it the
 * first time anyone opens it — an empty state is a screen you cannot review.
 */
export const MOCK_BUYER_ADDRESS = "7xKqPz4mNbVuTgRhE2sYcDwLkFj9AaBn3QeXvMr6UdWt";

function buildBoard(): MockBoard {
  const rand = makeRandom(SEED);

  // A pool of rivals, plus the wallet the player connects as. Sixteen is
  // enough that the six owner hues visibly repeat, which is the truth about
  // the palette and something the board should show rather than hide.
  const wallets = [MOCK_BUYER_ADDRESS, ...Array.from({ length: 15 }, () => base58(rand, 44))];

  // Weighted so a handful of wallets hold a lot and most hold one or two —
  // an evenly divided board is the one distribution the real thing will never
  // be, and it hides exactly the layout problems a leaderboard has.
  const weights = wallets.map((_, i) => (i < 4 ? 6 : i < 9 ? 3 : 1));
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const pickWallet = () => {
    let n = rand() * weightTotal;
    for (let i = 0; i < wallets.length; i++) {
      n -= weights[i];
      if (n <= 0) return wallets[i];
    }
    return wallets[0];
  };

  const territories = new Map<string, MockTerritory>();
  const flips: FlipRecord[] = [];

  for (const country of COUNTRIES) {
    // A third of the board is spoken for. Enough that it reads as contested,
    // sparse enough that there is somewhere to go.
    const claimed = rand() < 0.34;

    if (!claimed) {
      territories.set(country.iso2, {
        countryCode: country.iso2,
        isClaimed: false,
        currentPrice: game.basePrice,
        nextPrice: game.basePrice,
        currentPriceLamports: toLamports(game.basePrice),
        nextPriceLamports: toLamports(game.basePrice),
        ownerAddress: null,
        title: null,
        tagline: null,
        link: null,
        color: "",
        hasCustomBanner: false,
        claimedAt: null,
        flipCount: 0,
        lastTxSignature: null,
        version: 0,
        updatedAt: 0,
      });
      continue;
    }

    // Most claimed countries have changed hands once or twice; a few are
    // genuinely contested. The tail is what makes the activity feed — ordered
    // by price — have a top worth looking at.
    const roll = rand();
    const flipCount = roll > 0.94 ? 12 + Math.floor(rand() * 8) : 1 + Math.floor(rand() * 4);

    const owner = pickWallet();
    const previousOwner = flipCount > 1 ? pickWallet() : null;

    const currentLamports = priceAfterFlips(flipCount);
    const nextLamports = Math.round(currentLamports * game.priceMultiplier);
    const previousLamports = flipCount > 1 ? priceAfterFlips(flipCount - 1) : 0;

    const claimedAt = NOW - Math.floor(rand() * 40 * DAY);

    // Under half of owners have written a banner. The rest are the case the
    // board has to look right in: a colour, an address, and nothing else.
    const hasCustomBanner = rand() < 0.45;
    const copy = hasCustomBanner ? pick(rand, BANNERS) : null;

    const territory: MockTerritory = {
      countryCode: country.iso2,
      isClaimed: true,
      currentPrice: fromLamports(currentLamports),
      nextPrice: fromLamports(nextLamports),
      currentPriceLamports: currentLamports,
      nextPriceLamports: nextLamports,
      ownerAddress: owner,
      title: copy?.title ?? null,
      tagline: copy?.tagline || null,
      link: copy?.link || null,
      color: colorForAddress(owner),
      hasCustomBanner,
      claimedAt,
      flipCount,
      lastTxSignature: base58(rand, 88),
      version: flipCount,
      updatedAt: claimedAt,
    };
    territories.set(country.iso2, territory);

    // The takeover that put this owner here. One per country rather than a
    // full history: the activity feed is one row per country by design, and a
    // fixture that carries more than the UI reads is a fixture that drifts.
    flips.push({
      countryCode: country.iso2,
      previousOwner,
      newOwner: owner,
      previousPrice: fromLamports(previousLamports),
      newPrice: fromLamports(currentLamports),
      previousOwnerPayout: previousOwner
        ? fromLamports(previousLamports + Math.round((currentLamports - previousLamports) * game.previousOwnerShare))
        : 0,
      vaultPayout: previousOwner
        ? fromLamports(currentLamports - previousLamports - Math.round((currentLamports - previousLamports) * game.previousOwnerShare))
        : fromLamports(currentLamports),
      timestamp: claimedAt,
      txSignature: territory.lastTxSignature!,
      billboard: {
        title: territory.title ?? country.name,
        tagline: territory.tagline ?? "",
        link: territory.link ?? "",
        color: territory.color,
      },
    });
  }

  flips.sort((a, b) => b.timestamp - a.timestamp);
  return { territories, flips };
}

function ensureBoard(): MockBoard {
  if (!board) board = buildBoard();
  return board;
}

/** Strips the fixture's bookkeeping so callers only ever see the wire shape. */
function wire(t: MockTerritory): Territory {
  const { updatedAt: _updatedAt, ...rest } = t;
  return rest;
}

// ──── Latency ────
// Deliberately not seeded. The BOARD has to be identical between two reloads;
// the timing does not, and a fixed delay makes every spinner in the UI look
// correct for exactly one duration.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => sleep(base + Math.random() * spread);

// ──── Reservations ────

const reservations = new Map<
  string,
  { countryCode: string; buyerAddress: string; priceLamports: number }
>();

/**
 * Prepared banner drafts, awaiting their signature.
 *
 * The real `/banner` endpoint holds the trimmed content server-side between
 * prepare and commit, which is why `commitBanner` carries only a signature —
 * the content the player saw is the content the server already has. The mock
 * has to hold it somewhere too, or the editor would commit an empty banner.
 */
const drafts = new Map<string, BannerDraft>();

// ──── The adapter ────

export const mockAdapter: BoardAdapter = {
  kind: "mock",
  canSettle: true,

  async getState(since) {
    await jitter(140, 160);
    const state = ensureBoard();

    const cutoff = since ? Date.parse(since) : null;
    const partial = cutoff !== null && Number.isFinite(cutoff);

    const territories = [...state.territories.values()]
      .filter((t) => !partial || t.updatedAt > cutoff!)
      .map(wire);

    return {
      territories,
      flips: state.flips.slice(0, 80),
      syncedAt: new Date(Date.now()).toISOString(),
      partial,
    } satisfies BoardState;
  },

  async createIntent({ countryCode, buyerAddress, bidLamports }) {
    await jitter(280, 240);
    const state = ensureBoard();
    const territory = state.territories.get(countryCode);
    if (!territory) throw new BoardError("That country isn't on the board.", "not_found", 404);

    if (consumeMockFailure("rival_race")) {
      throw new BoardError(
        "Someone else is buying this country right now. Try again in a moment.",
        "reserved",
        409,
      );
    }

    let minPriceLamports = territory.nextPriceLamports ?? toLamports(game.basePrice);
    if (!territory.isClaimed) minPriceLamports = territory.currentPriceLamports!;

    // The board moved between the button and the quote. The server always
    // prices from its own row, so this is what that looks like from here —
    // and `usePurchase` has to stop and ask rather than charge the difference.
    if (consumeMockFailure("stale_price")) {
      minPriceLamports = Math.round(minPriceLamports * 1.2);
    }

    const priceLamports = Math.max(bidLamports ?? 0, minPriceLamports);
    const previousLamports = territory.currentPriceLamports ?? 0;
    const isFirstClaim = !territory.isClaimed;
    const profit = isFirstClaim
      ? 0
      : Math.round((priceLamports - previousLamports) * game.previousOwnerShare);
    const previousOwnerPayout = isFirstClaim ? 0 : previousLamports + profit;

    const intentId = `mock-${countryCode}-${Date.now()}`;
    reservations.set(intentId, { countryCode, buyerAddress, priceLamports });

    return {
      intentId,
      countryCode,
      // The mock has no server and therefore no bytes. It is a placeholder
      // string and not a decodable transaction, which is exactly why
      // `assertIntentIsSafe` below is a no-op here and must not stay one.
      transaction: "",
      minContextSlot: 0,
      priceLamports,
      price: fromLamports(priceLamports),
      minPriceLamports,
      minPrice: fromLamports(minPriceLamports),
      maxBidLamports: Math.min(minPriceLamports * game.maxBidMultiple, toLamports(MAX_PRICE)),
      isRaise: priceLamports > minPriceLamports,
      previousOwner: territory.ownerAddress,
      previousOwnerPayout: fromLamports(previousOwnerPayout),
      vaultPayout: fromLamports(priceLamports - previousOwnerPayout),
      isFirstClaim,
      expiresAtBlockHeight: 0,
      reused: false,
    } satisfies PurchaseIntent;
  },

  async releaseIntent({ intentId }) {
    reservations.delete(intentId);
  },

  assertIntentIsSafe() {
    // Nothing to check: the mock builds no transaction. The real one decodes
    // the server's bytes and asserts they move exactly `priceLamports` out of
    // `buyerAddress` and do nothing else. Leaving the call site wired to an
    // empty body is the point — see the note on the interface.
  },

  assertBannerIsFree() {
    // As above: no bytes to check. The real one decodes the memo and asserts
    // it carries no transfer instruction and no account it does not need.
  },

  async settle({ intentId }) {
    await jitter(700, 500);

    if (consumeMockFailure("network_drop")) {
      throw new BoardNetworkError("Couldn't reach the server. Check your connection.");
    }

    const reservation = reservations.get(intentId);
    if (!reservation) {
      throw new BoardError("That reservation has expired.", "expired", 410);
    }
    reservations.delete(intentId);

    const state = ensureBoard();
    const territory = state.territories.get(reservation.countryCode)!;
    const previousOwner = territory.ownerAddress;
    const previousLamports = territory.currentPriceLamports ?? 0;
    const priceLamports = reservation.priceLamports;
    const nextLamports = Math.round(priceLamports * game.priceMultiplier);
    const now = Date.now();
    const signature = base58(makeRandom((priceLamports ^ SEED ^ now) >>> 0), 88);

    const profit = previousOwner
      ? Math.round((priceLamports - previousLamports) * game.previousOwnerShare)
      : 0;
    const previousOwnerPayout = previousOwner ? previousLamports + profit : 0;

    // The banner does not survive a takeover — it belonged to the captain who
    // just lost the country. The new owner starts with their address colour
    // and nothing written on it, which is the state the editor exists for.
    const updated: MockTerritory = {
      ...territory,
      isClaimed: true,
      ownerAddress: reservation.buyerAddress,
      currentPrice: fromLamports(priceLamports),
      nextPrice: fromLamports(nextLamports),
      currentPriceLamports: priceLamports,
      nextPriceLamports: nextLamports,
      title: null,
      tagline: null,
      link: null,
      color: colorForAddress(reservation.buyerAddress),
      hasCustomBanner: false,
      claimedAt: now,
      flipCount: territory.flipCount + 1,
      lastTxSignature: signature,
      version: (territory.version ?? 0) + 1,
      updatedAt: now,
    };
    state.territories.set(updated.countryCode, updated);

    state.flips.unshift({
      countryCode: updated.countryCode,
      previousOwner,
      newOwner: reservation.buyerAddress,
      previousPrice: fromLamports(previousLamports),
      newPrice: fromLamports(priceLamports),
      previousOwnerPayout: fromLamports(previousOwnerPayout),
      vaultPayout: fromLamports(priceLamports - previousOwnerPayout),
      timestamp: now,
      txSignature: signature,
      billboard: { title: "", tagline: "", link: "", color: updated.color },
    });

    return { outcome: "settled", territory: wire(updated) } satisfies SettleResponse;
  },

  async prepareBanner({ countryCode, ownerAddress, title, tagline, link, color }) {
    await jitter(200, 200);
    // The server trims and echoes back what it will actually sign, so what is
    // previewed is what lands. The mock trims to the same limits.
    const draft: BannerDraft = {
      transaction: "",
      minContextSlot: 0,
      title: title.slice(0, LIMITS.title).trim(),
      tagline: tagline.slice(0, LIMITS.tagline).trim(),
      link: link.slice(0, LIMITS.link).trim(),
      color,
    };
    drafts.set(`${countryCode}:${ownerAddress}`, draft);
    return draft;
  },

  async commitBanner({ countryCode, ownerAddress }) {
    await jitter(400, 300);
    const state = ensureBoard();
    const territory = state.territories.get(countryCode);
    if (!territory || territory.ownerAddress !== ownerAddress) {
      throw new BoardError("You don't hold that country.", "not_owner", 403);
    }
    const key = `${countryCode}:${ownerAddress}`;
    const draft = drafts.get(key);
    if (!draft) throw new BoardError("That banner draft has expired.", "expired", 410);
    drafts.delete(key);

    const updated: MockTerritory = {
      ...territory,
      title: draft.title || null,
      tagline: draft.tagline || null,
      link: draft.link || null,
      color: draft.color,
      hasCustomBanner: true,
      updatedAt: Date.now(),
    };
    state.territories.set(countryCode, updated);
    return { territory: wire(updated) };
  },
};
