/**
 * The board, read once, for the marketing page.
 *
 * Deliberately not `BoardProvider`. That polls every ten seconds, keeps a Map
 * of 195 rows and a React context, and exists so a captain can watch the board
 * move underneath them. The landing page asks a smaller question — what does
 * this board look like right now — and asks it once, on arrival. A provider
 * would be the wrong shape, and a poll would be a lie about how often anyone
 * reads a page they are on their way through.
 *
 * Two rules hold this file's shape:
 *
 * 1. Everything heavy arrives through dynamic imports inside `load()`. That is
 *    load-bearing rather than tidy: `derive.ts` reaches `lib/countries.ts` and
 *    the adapter reaches the entire fixture, which together outweigh the hero
 *    they would be decorating. Out of the module's top level means out of the
 *    landing page's first paint — the numbers arrive after the page does, or
 *    they do not arrive and the page is still the page. Check `eager JS` on the
 *    landing route before promoting any of these to a static import.
 *
 * 2. What comes back is already presentable — names, not codes; numbers, not
 *    rows. Handing a `Territory` to the hero would put `getCountryByIso2` in
 *    the island that renders it, and `lib/countries.ts` back in the bundle
 *    rule 1 just kept it out of.
 */
import type { FlipRecord } from "./types";

/** The banner on the most expensive country, flattened for rendering. */
export interface SnapshotBanner {
  countryCode: string;
  countryName: string;
  /** What it costs to take. The ordering key, and the headline number. */
  price: number;
  /** Never empty: falls back to the country's name, as the app's editor does. */
  title: string;
  /** Either may be empty. An owner is not obliged to fill the whole card in. */
  tagline: string;
  link: string;
  /** The captain's map colour. */
  color: string;
  ownerAddress: string;
  /** How many times this country has changed hands. */
  flipCount: number;
}

export interface BoardSnapshot {
  claimed: number;
  total: number;
  captains: number;
  /** Null while nothing at all has been claimed. */
  top: SnapshotBanner | null;
  /** When the board last changed hands, in ms. Null if it never has. */
  lastTakeoverAt: number | null;
}

let pending: Promise<BoardSnapshot> | null = null;

/**
 * One read per page load, however many components ask for it.
 *
 * The hero and the banner section want the same snapshot and sit too far apart
 * in the document to share a parent, so they share a promise instead. Both get
 * the same object, and neither writes to it.
 */
export function readSnapshot(): Promise<BoardSnapshot> {
  pending ??= load();
  return pending;
}

async function load(): Promise<BoardSnapshot> {
  const [{ adapter }, { activityRows, boardStats }, { getCountryByIso2 }] =
    await Promise.all([
      import("./current"),
      import("./derive"),
      import("@/lib/countries"),
    ]);

  const state = await adapter.getState(null);
  const territories = new Map(state.territories.map((t) => [t.countryCode, t]));
  const stats = boardStats(territories, state.flips);

  // Ordered by what it costs to take, which is the ordering an advertiser can
  // move themselves up in — the same function, and the same reasoning, as the
  // activity screen. Row one is whoever paid the most to be standing there,
  // which is the only row a front page has any business printing.
  const [first] = activityRows(territories, state.flips);

  return {
    claimed: stats.claimed,
    total: stats.total,
    captains: stats.captains,
    top: first
      ? {
          countryCode: first.territory.countryCode,
          countryName:
            getCountryByIso2(first.territory.countryCode)?.name ??
            first.territory.countryCode,
          price: first.price,
          title:
            first.territory.title ??
            getCountryByIso2(first.territory.countryCode)?.name ??
            first.territory.countryCode,
          tagline: first.territory.tagline ?? "",
          link: first.territory.link ?? "",
          color: first.territory.color,
          ownerAddress: first.territory.ownerAddress ?? "",
          flipCount: first.territory.flipCount,
        }
      : null,
    // Newest-first is what the endpoint documents, not something it promises,
    // and "last takeover" on the front page is not a figure to take on trust
    // from an array's order.
    lastTakeoverAt:
      state.flips.reduce<FlipRecord | null>(
        (newest, flip) => (!newest || flip.timestamp > newest.timestamp ? flip : newest),
        null,
      )?.timestamp ?? null,
  };
}
