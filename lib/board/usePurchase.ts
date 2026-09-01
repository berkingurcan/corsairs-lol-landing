"use client";

/**
 * The purchase, as a state machine.
 *
 * The phone runs this flow off one `isSubmitting` boolean and a stack of
 * modal alerts, which works on a surface where a sheet can only be in one
 * place at a time. A panel that stays mounted cannot: it has to render the
 * middle of the flow, so the middle of the flow has to have names.
 *
 * Every state below gets built against the mock in step 4, because these are
 * the states the backend will arrive INTO. The expensive failure is designing
 * `idle` and `settled`, then discovering the middle three when the API lands.
 *
 * The order of operations is `BuySheet`'s exactly, and each step is there for
 * a reason that cost something to learn:
 *
 *   1. The server prices and reserves. A rival mid-purchase comes back as a
 *      409 HERE — before the wallet opens, so there is no payment to unwind.
 *   2. If the server quotes above what the button said, stop and ask. Charging
 *      the difference silently is a bait and switch.
 *   3. Check the bytes before signing them. The server sets the price; that is
 *      no reason to sign its transaction unread.
 *   4. Report the signature immediately — do NOT wait for local confirmation.
 *      The server confirms, and it records the signature before it does, so
 *      reporting early is what lets a purchase survive the tab being closed.
 */
import { useCallback, useRef, useState } from "react";

import { getCountryByIso2 } from "@/lib/countries";

import { BoardError, BoardNetworkError, type PurchaseIntent } from "./adapter";
import { useBoard } from "./BoardProvider";
import { formatPrice } from "./config";
import { useWallet, WalletError } from "@/lib/wallet/WalletProvider";

export type PurchaseStatus =
  | "idle"
  | "quoting"
  | "confirming-price"
  | "awaiting-signature"
  | "settling"
  | "settled"
  | "failed";

/**
 * Which shape the finished purchase took.
 *
 * `lost_race` is not a failure and is deliberately not filed as one: the money
 * moved and a refund was logged. Showing it under `failed` would tell someone
 * their payment vanished.
 */
export type PurchaseOutcome = "settled" | "pending" | "lost_race";

export interface PurchaseFailure {
  code: string;
  /** Written for a player. Goes straight on screen. */
  message: string;
}

export interface PurchaseState {
  status: PurchaseStatus;
  /** The country this flow is about, ISO-2. Null when idle. */
  countryCode: string | null;
  intent: PurchaseIntent | null;
  /** Set only in `confirming-price`: what was agreed, what was quoted. */
  priceChange: { agreed: number; quoted: number } | null;
  outcome: PurchaseOutcome | null;
  signature: string | null;
  /** Shown alongside a settled purchase that is not yet confirmed. */
  message: string | null;
  failure: PurchaseFailure | null;
}

const IDLE: PurchaseState = {
  status: "idle",
  countryCode: null,
  intent: null,
  priceChange: null,
  outcome: null,
  signature: null,
  message: null,
  failure: null,
};

function countryName(code: string): string {
  return getCountryByIso2(code)?.name ?? code;
}

/** Maps anything thrown before a signature exists onto something readable. */
function toFailure(caught: unknown): PurchaseFailure {
  if (caught instanceof WalletError) return { code: caught.code, message: caught.message };
  if (caught instanceof BoardError) {
    // A 409 is the rival-race case and deserves its own words: nothing was
    // charged, and the country may still be there in a moment.
    if (caught.status === 409) {
      return {
        code: "rival_race",
        message: "Someone else is buying this country right now. Nothing was charged — try again in a moment.",
      };
    }
    return { code: caught.code, message: caught.message };
  }
  return { code: "error", message: "That didn't go through. Nothing was charged." };
}

export function usePurchase() {
  const { adapter, syncNow } = useBoard();
  const wallet = useWallet();
  const [state, setState] = useState<PurchaseState>(IDLE);

  /**
   * How `confirming-price` suspends the flow.
   *
   * The confirmation is a question to a person in the middle of an async
   * sequence, so the sequence parks on a promise this ref resolves. Keeping it
   * out of state matters: resolving is not a render, and a re-render must not
   * hand back a second promise for the same question.
   */
  const answer = useRef<((confirmed: boolean) => void) | null>(null);

  const reset = useCallback(() => {
    answer.current = null;
    setState(IDLE);
  }, []);

  const confirmPrice = useCallback(() => answer.current?.(true), []);
  const declinePrice = useCallback(() => answer.current?.(false), []);

  /**
   * @param payable  the amount the button said, in SOL. Compared against what
   *                 the server quotes so "you chose to pay more" can be told
   *                 apart from "the board moved while you were looking".
   * @param bidLamports  sent ONLY when the player actually raised. Omitting it
   *                 asks to be quoted whatever the country costs right now,
   *                 which is what makes a moved board come back as a price to
   *                 confirm rather than as a refusal about a number that was
   *                 accurate ten seconds ago.
   */
  const buy = useCallback(
    async (params: { countryCode: string; payable: number; bidLamports?: number }) => {
      const { countryCode, payable, bidLamports } = params;
      const buyerAddress = wallet.publicKey;
      if (!buyerAddress) {
        setState({ ...IDLE, countryCode, status: "failed", failure: { code: "no_wallet", message: "Connect a wallet first." } });
        return;
      }

      setState({ ...IDLE, status: "quoting", countryCode });

      let intent: PurchaseIntent | null = null;
      let signature: string | null = null;

      try {
        // ──── 1. Price and reserve ────
        intent = await adapter.createIntent({
          countryCode,
          buyerAddress,
          ...(bidLamports ? { bidLamports } : {}),
        });

        // ──── 2. The price that moved ────
        // A raise always matches: the server quoted the number the player
        // typed back at them. This is for the other case — they took the
        // asking price and the asking price moved.
        if (Math.abs(intent.price - payable) > 1e-9) {
          const quoted = intent.price;
          setState((s) => ({
            ...s,
            status: "confirming-price",
            intent,
            priceChange: { agreed: payable, quoted },
          }));

          const confirmed = await new Promise<boolean>((resolve) => {
            answer.current = resolve;
          });
          answer.current = null;

          if (!confirmed) {
            // Hand the country back now rather than sitting on it for the rest
            // of the blockhash's life. Nothing was signed, so nobody is at
            // risk, and it would expire on its own regardless.
            void adapter.releaseIntent({ intentId: intent.intentId, buyerAddress }).catch(() => {});
            void syncNow();
            setState(IDLE);
            return;
          }
        }

        // ──── 3. Check what the server built, then sign it ────
        setState((s) => ({ ...s, status: "awaiting-signature", intent, priceChange: null }));
        adapter.assertIntentIsSafe(intent, buyerAddress);

        signature = await wallet.signAndSend(intent.transaction, intent.minContextSlot);

        // ──── 4. Report immediately ────
        setState((s) => ({ ...s, status: "settling", signature }));
        const result = await adapter.settle({ intentId: intent.intentId, signature });

        void wallet.refreshBalance();
        void syncNow();

        setState({
          status: "settled",
          countryCode,
          intent,
          priceChange: null,
          outcome: result.outcome,
          signature,
          message:
            result.message ??
            (result.outcome === "pending"
              ? `${countryName(countryCode)} becomes yours as soon as the network confirms. You can close this.`
              : result.outcome === "lost_race"
                ? `Someone took ${countryName(countryCode)} moments before your payment landed. Your refund has been logged.`
                : null),
          failure: null,
        });
      } catch (caught) {
        // ──── The rule this whole branch exists for ────
        // A signature exists. The money is on its way whatever happened next,
        // and the server records the signature before it confirms — so a
        // connection lost here is PAID, UNCONFIRMED. It must never be shown as
        // a failure, and it must never say "nothing was charged".
        if (signature) {
          setState({
            status: "settled",
            countryCode,
            intent,
            priceChange: null,
            outcome: "pending",
            signature,
            message:
              caught instanceof BoardNetworkError
                ? `Your payment was sent. We lost the connection before it was confirmed, so ${countryName(countryCode)} will land on the board once the network catches up — nothing else is needed from you.`
                : `Your payment was sent and is being confirmed. ${countryName(countryCode)} will appear on the board shortly.`,
            failure: null,
          });
          void syncNow();
          return;
        }

        // Nothing was signed. Hand the reservation back if we took one.
        if (intent) {
          void adapter.releaseIntent({ intentId: intent.intentId, buyerAddress }).catch(() => {});
        }
        // A 409 means the board moved under us; pull the new state in so the
        // panel is showing the truth by the time the message is read.
        if (caught instanceof BoardError && caught.status === 409) void syncNow();

        setState({ ...IDLE, status: "failed", countryCode, failure: toFailure(caught) });
      }
    },
    [adapter, syncNow, wallet],
  );

  /** The exact amount being signed, restated for the awaiting-signature state. */
  const signingLabel = state.intent ? formatPrice(state.intent.price) : null;

  return { ...state, signingLabel, buy, confirmPrice, declinePrice, reset };
}
