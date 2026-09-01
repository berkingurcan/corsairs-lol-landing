/**
 * Everything about the project that is not design.
 *
 * Numbers here are mirrors of the app and the settlement server. The
 * authoritative copies, in the order that wins when they disagree:
 *
 *   1. server/supabase/migrations/*.sql  — builds the transaction
 *   2. server/supabase/functions/_shared/config.ts
 *   3. src/constants/gameConfig.ts       — the app's display copy
 *
 * If one of these drifts, this page advertises a payout the chain does not
 * make. Check against the SQL before editing a figure.
 */

export const site = {
  name: "corsairs.lol",
  url: "https://corsairs.lol",
  title: "corsairs.lol — Every country has a price.",
  description:
    "A live territory game on Solana. Claim one of 195 countries for 0.05 SOL, fly your banner over it, and get paid when the next captain takes it. No token.",

  /**
   * The only outbound link on the site. There is no store listing URL and no
   * public repo to point at, so nothing here promises a download that does not
   * exist yet — every call to action sends people here instead.
   */
  x: "https://x.com/corsairslol",
  xHandle: "@corsairslol",

  /** Deep link the app registers. `share.ts` sends people to /t/<ISO2>. */
  appScheme: "corsairslol",
} as const;

/**
 * Whether /app is reading the real settlement API.
 *
 * The web board's country pages (/app/c/<ISO2>) say the same thing about the
 * same country as the share landings (/t/<ISO2>), so exactly one of the two
 * gets indexed and gets the sitemap. While the board is mock-fed that has to
 * be /t: those links are already in the wild — `share.ts` in the Seeker app
 * builds them — and pointing a real player's share at a page of invented
 * prices is worse than pointing it at a page that admits it knows no price.
 *
 * Flipping this to `true` moves indexing and the sitemap to /app/c. The other
 * half of the flip is the redirect block in vercel.json, which is commented
 * out beside a pointer to this constant. Two edits, and they are the whole
 * handoff.
 */
export const boardIsLive = false;

/** Mirrors src/constants/gameConfig.ts on the app's master branch. */
export const game = {
  /** BASE_TERRITORY_PRICE.SOL — opening price of an unclaimed country. */
  basePrice: 0.05,
  currency: "SOL",

  /** PRICE_MULTIPLIER_BPS 12000 — each takeover floor is 1.20x the last price. */
  priceMultiplier: 1.2,

  /**
   * PREVIOUS_OWNER_PROFIT_SHARE_BPS / VAULT_PROFIT_SHARE_BPS, both 5000.
   * Authority: split_payout() in 0005_treasury_share.sql.
   */
  previousOwnerShare: 0.5,
  treasuryShare: 0.5,

  /** MAX_BID_MULTIPLE — fat-finger guard on a raise, not a rule of the game. */
  maxBidMultiple: 100,

  /** QUICK_RAISE_BPS — presets offered next to the bid field. */
  quickRaises: [0.1, 0.25, 0.5],

  /**
   * LIMITS — enforced on input and again before signing. Kept as a mirror of
   * the app config; the page no longer prints them, because a character count
   * is not a reason to play.
   */
  limits: { title: 22, tagline: 120, link: 150 },

  countries: 195,
} as const;

/**
 * What a takeover moves, at a given previous price.
 *
 * Mirrors `split_payout`: the previous owner is made whole on principal and
 * takes half the increase; the treasury is the remainder, so the two always
 * sum to exactly the sale and no lamport is invented by rounding.
 */
export function splitPayout(previousPrice: number, salePrice: number) {
  const delta = salePrice - previousPrice;
  const previousOwnerProfit = delta * game.previousOwnerShare;
  const previousOwnerPayout = previousPrice + previousOwnerProfit;
  return {
    delta,
    previousOwnerProfit,
    previousOwnerPayout,
    treasuryPayout: salePrice - previousOwnerPayout,
  };
}

/** The price step, as the table on the page shows it. */
export function priceLadder(steps: number) {
  const rows = [];
  // `game` is `as const`, so basePrice narrows to its literal — widen it or the
  // reassignment at the bottom of the loop will not type-check.
  let price: number = game.basePrice;
  for (let i = 0; i < steps; i++) {
    if (i === 0) {
      rows.push({
        event: "First capture",
        buyerPays: price,
        previousOwner: null as number | null,
        treasury: price,
      });
      continue;
    }
    const sale = price * game.priceMultiplier;
    const { previousOwnerPayout, treasuryPayout } = splitPayout(price, sale);
    rows.push({
      event: i === 1 ? "Taken at +20%" : "Taken again",
      buyerPays: sale,
      previousOwner: previousOwnerPayout,
      treasury: treasuryPayout,
    });
    price = sale;
  }
  return rows;
}

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
