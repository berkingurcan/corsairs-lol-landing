/**
 * The seam.
 *
 * No screen imports an adapter and no screen knows whether its data is real.
 * Going live is implementing `http.ts` and changing one line in
 * `BoardProvider.tsx` — that is the whole requirement, and it is only cheap
 * because it was built before anything was written against it.
 *
 * The method names and every shape below are `src/services/apiClient.ts`,
 * because that file is already the contract the Supabase functions answer to.
 * The reasoning it records is worth restating, since it is what the shapes are
 * for: the app used to price a country from local state and build its own
 * transfer instructions, which made the price a client input — and a price a
 * client can choose is not a price. So:
 *
 *   createIntent   the server prices the country, reserves it, and returns the
 *                  bytes to sign. The client may name what it wants to PAY —
 *                  a bid above the going rate — but the server decides whether
 *                  that amount is allowed and quotes the one it accepted.
 *   settle         the server re-reads the transaction off the chain and only
 *                  then records ownership.
 *   prepare/commitBanner   the same shape, for the transfer-free banner memo.
 *   getState       the board, which is read rather than owned.
 */
import type { FlipRecord, Territory } from "./types";

// ──── Errors ────
// One class per thing the UI has to say differently. "Something went wrong" is
// five bugs wearing one coat.

/** A failure the player is meant to read. `message` goes straight on screen. */
export class BoardError extends Error {
  constructor(
    message: string,
    readonly code: string = "error",
    readonly status: number = 0,
  ) {
    super(message);
    this.name = "BoardError";
  }
}

/** Thrown when the build has no settlement server configured at all. */
export class BoardNotConfiguredError extends BoardError {
  constructor() {
    super(
      "This build has no settlement server configured, so countries can't be bought.",
      "not_configured",
    );
    this.name = "BoardNotConfiguredError";
  }
}

/**
 * Its own type because a network failure AFTER the wallet has signed is not a
 * failed purchase, and the UI must never answer one with "nothing was charged".
 * `usePurchase` branches on whether a signature exists, not on this class
 * alone — but it cannot make that distinction if the error arrives untyped.
 */
export class BoardNetworkError extends BoardError {
  constructor(message: string) {
    super(message, "network");
    this.name = "BoardNetworkError";
  }
}

/** Thrown when server-built bytes are not what the quote described. */
export class TransactionMismatchError extends BoardError {
  constructor(detail: string) {
    super(
      `This purchase doesn't look right, so it wasn't signed. (${detail})`,
      "tx_mismatch",
    );
    this.name = "TransactionMismatchError";
  }
}

// ──── Board state ────

export interface BoardState {
  territories: Territory[];
  flips: FlipRecord[];
  syncedAt: string;
  /** True when only changed territories were returned. */
  partial: boolean;
}

// ──── Purchase ────

export interface PurchaseIntent {
  intentId: string;
  countryCode: string;
  /** Base64 transaction, built and priced by the server. */
  transaction: string;
  minContextSlot: number;

  /** What this buyer pays — the floor, or the amount they raised to. */
  priceLamports: number;
  price: number;

  /**
   * What the country costs to take right now, before any raise. Sent so the
   * client can tell "you chose to pay more" apart from "the board moved while
   * you were looking" — from the price alone those are the same number.
   */
  minPriceLamports: number;
  minPrice: number;
  /** Ceiling on a bid for this country, as the server enforces it. */
  maxBidLamports: number;
  /** True when the buyer is paying above the going rate. */
  isRaise: boolean;

  previousOwner: string | null;
  previousOwnerPayout: number;
  vaultPayout: number;
  isFirstClaim: boolean;

  expiresAtBlockHeight: number;
  /** True when this buyer already held a live reservation on this country. */
  reused: boolean;
}

export interface SettleResponse {
  /**
   * settled   ownership recorded
   * pending   paid, not yet confirmed — the server finishes it unattended
   * lost_race paid, but the country moved first. A refund has been logged.
   */
  outcome: "settled" | "pending" | "lost_race";
  territory: Territory | null;
  message?: string;
}

// ──── Banner ────

export interface BannerDraft {
  transaction: string;
  minContextSlot: number;
  /** Echoed back after the server's own trimming, so what is shown is signed. */
  title: string;
  tagline: string;
  link: string;
  color: string;
}

// ──── The interface ────

export interface BoardAdapter {
  /** Which implementation this is. For the dev banner, and for nothing else. */
  readonly kind: "mock" | "http";

  /** True when buying is possible. False leaves the board readable and inert. */
  readonly canSettle: boolean;

  /**
   * @param since `syncedAt` from the previous response. Fetches only what has
   *              changed — the board is 195 rows and almost none of them move
   *              between two polls.
   */
  getState(since?: string | null): Promise<BoardState>;

  /**
   * Prices and reserves a country.
   *
   * A 409 here means someone else is mid-purchase. That is the entire fix for
   * "two buyers, one price": the second buyer is turned away BEFORE the wallet
   * opens, so there is no second payment to unwind.
   *
   * `bidLamports` is the one number the client is allowed to name, and naming
   * it is still not deciding it. Omit it to be quoted the floor — which is
   * what makes a board that moved come back as a price to confirm rather than
   * as a refusal about a number that was accurate ten seconds ago.
   */
  createIntent(params: {
    countryCode: string;
    buyerAddress: string;
    bidLamports?: number;
  }): Promise<PurchaseIntent>;

  /**
   * Hands a reservation back after the player declines to go through with it.
   *
   * Fire-and-forget: the reservation expires on its own once its blockhash
   * dies, so failing to release only means the country stays locked a little
   * longer. Never call this once a signature exists — the server refuses
   * anyway, because that transaction may already be on chain.
   */
  releaseIntent(params: { intentId: string; buyerAddress: string }): Promise<void>;

  /**
   * The transaction the server built is not a reason to sign its bytes unread.
   *
   * Asserts that the transaction spends exactly the quoted amount from this
   * wallet and does nothing else, so a tampered or swapped response cannot get
   * a drain approved under the label of a country. Throws
   * `TransactionMismatchError`.
   *
   * It is on the adapter rather than inside `usePurchase` for one reason: the
   * mock has no bytes to check, and a check that lives at the call site is a
   * check somebody deletes when it fails against a fixture. Here the call site
   * is permanent and only the implementation is empty, so the real one has a
   * seat waiting for it instead of needing to be remembered.
   */
  assertIntentIsSafe(intent: PurchaseIntent, buyerAddress: string): void;

  /**
   * Reports the signature. Call as soon as the wallet returns one — do NOT
   * wait to confirm locally first. The server does the confirming, and it
   * records the signature before it does, so reporting early is what lets a
   * purchase survive the tab being closed mid-flight.
   */
  settle(params: { intentId: string; signature: string }): Promise<SettleResponse>;

  /**
   * Asserts the banner transaction moves no money.
   *
   * A banner is a memo: it costs the network fee and nothing else, which is
   * the promise the editor prints under its save button. A response that
   * quietly attached a transfer would be signed under that promise, so the
   * bytes are checked before the wallet sees them for the same reason a
   * purchase's are — and, like that one, the call site is permanent while only
   * the implementation is empty.
   */
  assertBannerIsFree(draft: BannerDraft, ownerAddress: string): void;

  prepareBanner(params: {
    countryCode: string;
    ownerAddress: string;
    title: string;
    tagline: string;
    link: string;
    color: string;
  }): Promise<BannerDraft>;

  commitBanner(params: {
    countryCode: string;
    ownerAddress: string;
    signature: string;
  }): Promise<{ territory: Territory | null }>;
}
