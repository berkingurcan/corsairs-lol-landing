/**
 * What the board says about a wallet, and about itself.
 *
 * The settlement API returns two things — the 195 rows and a window of recent
 * takeovers — and everything the read-only screens show is derived from those.
 * It lives here rather than in the screens for the reason every money figure
 * in this repo lives in one place: three screens computing "realised profit"
 * three ways is three different answers to the same question.
 *
 * ⚠ The flip window is BOUNDED. `/state` returns recent takeovers, not the
 * whole history, so anything summed over flips is "in the window we have" and
 * not "ever". That is fine for a feed and for alerts, and it is NOT fine for a
 * lifetime total — which is why `realisedProfit` below says so in its name's
 * neighbourhood rather than pretending otherwise. If the product ever needs a
 * true lifetime figure it comes from the server, which has the whole table.
 */
import { getCountryByIso2 } from "@/lib/countries";

import { calculateProfitSplit, getPriceToTake } from "./config";
import type { FlipRecord, OutbidAlert, Territory } from "./types";

export interface Holdings {
  /** Countries this wallet holds now, most valuable first. */
  held: Territory[];
  /** What every one of them would fetch if taken at the floor, summed. */
  portfolioValue: number;
  /** What it would cost to take them all — the number a rival is looking at. */
  defenceValue: number;
  /** Profit banked from being outbid, within the window. */
  realisedProfit: number;
  /** Paid out, within the window. */
  spent: number;
  /** Countries lost, within the window. */
  timesOutbid: number;
  /** Each carries the banner that was up, so taking it back can restore it. */
  alerts: OutbidAlert[];
}

export function holdingsFor(
  territories: Map<string, Territory>,
  flips: FlipRecord[],
  address: string | null,
): Holdings {
  const held = address
    ? [...territories.values()]
        .filter((t) => t.ownerAddress === address)
        .sort((a, b) => b.currentPrice - a.currentPrice)
    : [];

  const alerts: OutbidAlert[] = [];
  let realisedProfit = 0;
  let spent = 0;

  for (const flip of flips) {
    if (address && flip.newOwner === address) spent += flip.newPrice;
    if (!address || flip.previousOwner !== address) continue;

    const country = getCountryByIso2(flip.countryCode);
    const profit = flip.previousOwnerPayout - flip.previousPrice;
    realisedProfit += profit;
    alerts.push({
      previousOwner: address,
      countryCode: flip.countryCode,
      countryName: country?.name ?? flip.countryCode,
      countryFlag: country?.flag ?? "🏴",
      newOwnerAddress: flip.newOwner,
      newPrice: flip.newPrice,
      yourPayout: flip.previousOwnerPayout,
      yourProfit: profit,
      timestamp: flip.timestamp,
      txSignature: flip.txSignature,
      previousBillboard: flip.billboard,
    });
  }

  return {
    held,
    portfolioValue: held.reduce((sum, t) => sum + t.currentPrice, 0),
    defenceValue: held.reduce((sum, t) => sum + getPriceToTake(t), 0),
    realisedProfit,
    spent,
    timesOutbid: alerts.length,
    alerts,
  };
}

export interface LeaderRow {
  address: string;
  countries: number;
  value: number;
}

/**
 * Who holds the most.
 *
 * By COUNT and not by value, because count is what the board shows and value
 * is what the board shows if you do arithmetic. A leaderboard that disagrees
 * with what someone can see in front of them is a leaderboard they distrust.
 */
export function leaderboard(territories: Map<string, Territory>, limit = 8): LeaderRow[] {
  const rows = new Map<string, LeaderRow>();
  for (const territory of territories.values()) {
    if (!territory.isClaimed || !territory.ownerAddress) continue;
    const row = rows.get(territory.ownerAddress) ?? {
      address: territory.ownerAddress,
      countries: 0,
      value: 0,
    };
    row.countries += 1;
    row.value += territory.currentPrice;
    rows.set(territory.ownerAddress, row);
  }
  return [...rows.values()]
    .sort((a, b) => b.countries - a.countries || b.value - a.value)
    .slice(0, limit);
}

export interface BoardStats {
  claimed: number;
  total: number;
  /** Every price on the board, summed. What the map is worth right now. */
  onTheBoard: number;
  /** Moved through the window's takeovers. */
  settled: number;
  /** The country that has changed hands most. */
  mostContested: Territory | null;
  captains: number;
}

export function boardStats(
  territories: Map<string, Territory>,
  flips: FlipRecord[],
): BoardStats {
  const all = [...territories.values()];
  const claimed = all.filter((t) => t.isClaimed);
  const captains = new Set(claimed.map((t) => t.ownerAddress));
  return {
    claimed: claimed.length,
    total: all.length,
    onTheBoard: claimed.reduce((sum, t) => sum + t.currentPrice, 0),
    settled: flips.reduce((sum, f) => sum + f.newPrice, 0),
    mostContested:
      claimed.length === 0
        ? null
        : claimed.reduce((best, t) => (t.flipCount > best.flipCount ? t : best)),
    captains: captains.size,
  };
}

export interface ActivityRow {
  territory: Territory;
  /** What it costs to take right now. The ordering key, and the point. */
  price: number;
  /** The takeover that put this captain here, if it is in the window. */
  flip: FlipRecord | null;
}

/**
 * The board, ordered by price.
 *
 * Not by time, and one row per COUNTRY rather than one per takeover. The
 * reasoning is load-bearing enough to restate in code: these rows are
 * advertisements someone paid for, so the ordering has to be one an advertiser
 * can move themselves up in — and moving up it is exactly what they paid for.
 * A chronological feed sells the top slot to whoever acted most recently,
 * which is nothing anyone can buy.
 *
 * Each row still carries the takeover that put its owner there, so it reads as
 * activity rather than as a price list.
 */
export function activityRows(
  territories: Map<string, Territory>,
  flips: FlipRecord[],
): ActivityRow[] {
  const latest = new Map<string, FlipRecord>();
  for (const flip of flips) {
    const seen = latest.get(flip.countryCode);
    if (!seen || flip.timestamp > seen.timestamp) latest.set(flip.countryCode, flip);
  }

  return [...territories.values()]
    .filter((t) => t.isClaimed)
    .map((territory) => ({
      territory,
      price: getPriceToTake(territory),
      flip: latest.get(territory.countryCode) ?? null,
    }))
    .sort(
      (a, b) =>
        b.price - a.price ||
        // Ties are not rare: the price ladder is a fixed 1.20x from one base,
        // so every country that has changed hands the same number of times
        // sits at exactly the same price. Left to the map's iteration order
        // the run would be alphabetical by ISO code, which is arbitrary and
        // silently stable — the worst combination, because it looks deliberate.
        // Most recently taken first is a real answer and the one that keeps a
        // block of identical prices reading as activity.
        (b.flip?.timestamp ?? 0) - (a.flip?.timestamp ?? 0) ||
        a.territory.countryCode.localeCompare(b.territory.countryCode),
    );
}

/** What a takeover moved, for a row that has one. */
export function flipSplit(flip: FlipRecord) {
  return calculateProfitSplit(flip.previousPrice, flip.newPrice);
}
