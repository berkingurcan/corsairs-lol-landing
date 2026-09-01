/**
 * Game configuration and the money helpers, for the web client.
 *
 * A mirror of `src/constants/gameConfig.ts`, minus everything a browser has no
 * business knowing. The numbers that the marketing page also prints are not
 * re-declared here — they are imported from `lib/site.ts`, which already
 * carries them and already says which file wins when they disagree. Three
 * copies in one repo is how a page advertises a payout the chain does not make.
 *
 * Currency and network are build-time constants on the phone and they stay
 * build-time constants here: every combination of {SKR, SOL} x {devnet,
 * mainnet} is a configuration that has to be tested, and three of the four are
 * ways to end up staring at an empty map. This build is SOL on mainnet-beta.
 * Every price on the board is real money.
 */
import { game } from "@/lib/site";

export type SolanaNetwork = "devnet" | "mainnet-beta";

export const NETWORK: SolanaNetwork = "mainnet-beta";

/** Appended to explorer URLs. Empty on mainnet, which is the default cluster. */
const EXPLORER_QUERY = NETWORK === "mainnet-beta" ? "" : `?cluster=${NETWORK}`;

export const CURRENCY = "SOL";
export const SOL_DECIMALS = 9;
export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Absolute ceiling on a territory's price, in whole SOL.
 *
 * Not a game rule — a backstop. Server-side every amount is an integer lamport
 * count, and past roughly 768,000 SOL the arithmetic that derives the next
 * price overflows a 64-bit integer, which would leave the country permanently
 * unpriceable. Mirrors `max_price_lamports()` in SQL, which is where it is
 * enforced; this copy only keeps the bid field from offering a number the
 * server will refuse.
 */
export const MAX_PRICE = 100_000;

/** How often the board is re-fetched while the tab is visible. */
export const POLL_INTERVAL_MS = 10_000;

/**
 * The same poll while the tab is hidden.
 *
 * Slowed rather than stopped: a board that is minutes stale on return shows
 * countries someone no longer owns. But nobody is looking at it, so the
 * ten-second cadence buys nothing, and the visibility handler re-syncs the
 * instant the tab comes back anyway.
 */
export const POLL_INTERVAL_HIDDEN_MS = 60_000;

/**
 * Banner field limits, enforced on input and again before signing.
 *
 * NOTE: `Billboard.title` in types.ts is commented "Max 32 chars", which
 * disagrees with GAME_CONFIG.LIMITS.TITLE_MAX_CHARS (22) and with lib/site.ts
 * (22). Two of the three say 22, including the one the server enforces, so 22
 * is what this client uses. The stale comment is in the app repo and should be
 * corrected there — it was copied down verbatim on purpose.
 */
export const LIMITS = game.limits;

/**
 * Prices are always tabular and always four decimals.
 *
 * `formatPrice()` on the phone renders two to four, and BRAND.md requires four.
 * Those coexisted because one governs the app and the other governs cards; the
 * web client is both — it renders the board AND the share image — so it pins
 * to four everywhere rather than carrying a second implementation. The
 * argument is there in the parameter so a caller who needs otherwise has to
 * say so out loud.
 */
export function formatAmount(amount: number, decimals = 4): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** e.g. "0.0600 SOL". */
export function formatPrice(amount: number, decimals = 4): string {
  return `${formatAmount(amount, decimals)} ${CURRENCY}`;
}

/** Wallet addresses and signatures, at the length a row can carry. */
export function shortenAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function toLamports(amount: number): number {
  return Math.round(amount * LAMPORTS_PER_SOL);
}

export function fromLamports(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Price required to take a territory from its current owner.
 *
 * DISPLAY ONLY. This is a local estimate for a button label; the price that is
 * actually charged comes from the server, which derives it from a locked row
 * in integer lamports. Prefer `territory.nextPrice` — this is the fallback for
 * a territory the client has cached but not re-synced.
 */
export function getNextOutbidPrice(currentPrice: number): number {
  return currentPrice * game.priceMultiplier;
}

export function getPriceToTake(territory: {
  isClaimed: boolean;
  currentPrice: number;
  nextPrice?: number | null;
}): number {
  if (typeof territory.nextPrice === "number" && territory.nextPrice > 0) {
    return territory.nextPrice;
  }
  return territory.isClaimed
    ? Math.round(getNextOutbidPrice(territory.currentPrice) * 1000) / 1000
    : territory.currentPrice;
}

/**
 * Payout breakdown for a takeover. The previous owner is made whole on their
 * principal and takes half the increase; the vault takes the remainder.
 *
 * The vault side is derived as the remainder, matching the server's
 * `split_payout`, so the two payouts always sum to exactly the price. Taking
 * the treasury share as a second percentage would agree at a 50/50 split and
 * drift at any other.
 */
export function calculateProfitSplit(previousPrice: number, newPrice: number) {
  const delta = newPrice - previousPrice;
  const previousOwnerProfit = delta * game.previousOwnerShare;
  const previousOwnerPayout = previousPrice + previousOwnerProfit;
  return {
    delta,
    previousOwnerProfit,
    previousOwnerPayout,
    vaultPayout: newPrice - previousOwnerPayout,
  };
}

/**
 * Highest amount a buyer may bid, given what the country costs to take.
 *
 * Two ceilings, whichever bites first: 100x the floor catches a slipped
 * keystroke, and MAX_PRICE catches the case where 100x the floor is a number
 * the server's integer arithmetic cannot carry. Mirrors `max_bid_lamports()`
 * in SQL.
 */
export function getMaxBid(minPrice: number): number {
  return Math.min(minPrice * game.maxBidMultiple, MAX_PRICE);
}

/** Preset raises offered next to the bid field, as fractions over the floor. */
export const QUICK_RAISES = game.quickRaises;

/**
 * Turns what someone typed into an amount, or null if it isn't one.
 *
 * Typed text is not a number: it arrives with stray spaces, a comma where the
 * decimal point belongs (most of the world), a leading dot, or nothing at all
 * while the field is being cleared. Every one of those has to read as "not a
 * bid yet" rather than as zero — a field that silently becomes 0 mid-edit
 * reports a validation error at you for something you are still typing.
 *
 * Deliberately strict about what a number looks like: `Number()` alone accepts
 * "0x10", "1e9" and " " (which is 0), none of which anyone meant to bid.
 */
export function parseAmountInput(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed)) return null;

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * The typed amount as integer lamports, or null.
 *
 * Rounding happens exactly once, here, and the result is what travels: the
 * server rejects a fractional lamport, and floating-point SOL cannot survive
 * the trip intact. `0.1 + 0.2` is the reason this function exists.
 */
export function parseAmountToLamports(text: string): number | null {
  const amount = parseAmountInput(text);
  if (amount === null) return null;

  const lamports = toLamports(amount);
  if (!Number.isSafeInteger(lamports) || lamports <= 0) return null;
  return lamports;
}

/** Solana Explorer URL for the active cluster. */
export function getExplorerUrl(path: string): string {
  return `https://explorer.solana.com/${path}${EXPLORER_QUERY}`;
}
