/**
 * The wire contract.
 *
 * Copied verbatim from `src/types/territory.ts` in the app repo, comments and
 * all. This is what the settlement API returns, so it is not a place to have
 * opinions: an "improvement" here is a divergence between what the server
 * sends and what this client believes it sent, and it will not surface until
 * a field is silently undefined in production.
 *
 * If a shape below is wrong, it is wrong in the app repo first. Fix it there
 * and copy the result down.
 */

/** Banner content an owner attaches to a territory. Never part of settlement. */
export interface Billboard {
  /** Max 32 chars. Defaults to the country name when the owner sets nothing. */
  title: string;
  /** Max 120 chars. */
  tagline: string;
  /** Max 150 chars. */
  link: string;
  /** Map fill, hex. Auto-derived from the owner's address until they change it. */
  color: string;
}

/** State of a single territory. */
export interface Territory {
  /** ISO-2 country code — the unique territory ID. */
  countryCode: string;

  isClaimed: boolean;

  /** Price the current owner paid, in the active currency. */
  currentPrice: number;

  /**
   * What the next buyer pays, as quoted by the server. Undefined only for a
   * territory the app has never synced — `getPriceToTake()` falls back to the
   * local curve in that case. Never compute this and send it anywhere: the
   * server prices every purchase from its own row.
   */
  nextPrice?: number;

  /** Authoritative integer amounts. The SOL fields above are for rendering. */
  currentPriceLamports?: number;
  nextPriceLamports?: number;

  /** Current owner's wallet address (base58), or null if unclaimed. */
  ownerAddress: string | null;

  /** Banner fields. Null until the owner writes one. */
  title: string | null;
  tagline: string | null;
  link: string | null;

  /** Map fill. Always set — auto-derived at claim time. */
  color: string;

  /** True once the owner has explicitly edited the banner. */
  hasCustomBanner: boolean;

  /** When the current owner claimed it (ms). */
  claimedAt: number | null;

  /** How many times this territory has changed hands. */
  flipCount: number;

  /** Signature of the most recent claim. */
  lastTxSignature: string | null;

  /**
   * Bumped by the server on every ownership change. Carried so the app can
   * tell a genuinely newer row from a re-delivery of one it already has —
   * `claimedAt` cannot, because two takeovers can land in the same
   * millisecond.
   */
  version?: number;
}

/** A single takeover. */
export interface FlipRecord {
  countryCode: string;
  /** Wallet displaced, or null on a first claim. */
  previousOwner: string | null;
  newOwner: string;
  previousPrice: number;
  newPrice: number;
  previousOwnerPayout: number;
  vaultPayout: number;
  timestamp: number;
  txSignature: string;
  /** Banner at the moment of the flip, for the activity feed. */
  billboard: Billboard;
}

/** Aggregated stats for a wallet. */
export interface PlayerStats {
  walletAddress: string;
  territoriesOwned: number;
  ownedCountryCodes: string[];
  /** Realised profit from being outbid. */
  totalProfit: number;
  totalSpent: number;
  timesOutbid: number;
  totalClaims: number;
}

/** Leaderboard row. */
export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  value: number;
  label: string;
}

/** Shown to a player who lost a territory. */
export interface OutbidAlert {
  /** The wallet that was displaced — the only wallet this alert belongs to. */
  previousOwner: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  newOwnerAddress: string;
  newPrice: number;
  yourPayout: number;
  yourProfit: number;
  timestamp: number;
  txSignature: string;
  /** The banner they had up, so taking it back can restore it. */
  previousBillboard: Billboard;
}
