"use client";

/**
 * Writing a banner.
 *
 * The same three-step shape as a purchase, and for the same reason: a memo is
 * only text, and text proves nothing about who owns a country. The server
 * composes the memo, the wallet signs it, and the server checks the signer
 * against the row that says who the owner is before it writes anything.
 *
 * Deliberately a separate flow from `usePurchase`, exactly as the phone keeps
 * `EditBannerSheet` separate from `BuySheet`: none of this is part of
 * settlement, so none of it belongs between a player and their wallet. It is
 * what lets the purchase itself stay at two clicks.
 */
import { useCallback, useState } from "react";

import { BoardError, BoardNetworkError } from "./adapter";
import { useBoard } from "./BoardProvider";
import { useWallet, WalletError } from "@/lib/wallet/WalletProvider";

export type BannerStatus =
  | "idle"
  | "preparing"
  | "awaiting-signature"
  | "saving"
  | "saved"
  | "failed";

export interface BannerDraftInput {
  countryCode: string;
  title: string;
  tagline: string;
  link: string;
  color: string;
}

export function useBanner() {
  const { adapter, syncNow } = useBoard();
  const wallet = useWallet();

  const [status, setStatus] = useState<BannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const save = useCallback(
    async (input: BannerDraftInput) => {
      const ownerAddress = wallet.publicKey;
      if (!ownerAddress) {
        setStatus("failed");
        setError("Reconnect your wallet to edit this banner.");
        return false;
      }

      setStatus("preparing");
      setError(null);

      try {
        // The server trims and echoes back what it will actually sign, so what
        // was previewed is what lands.
        const draft = await adapter.prepareBanner({ ...input, ownerAddress });

        setStatus("awaiting-signature");
        adapter.assertBannerIsFree(draft, ownerAddress);
        const signature = await wallet.signAndSend(draft.transaction, draft.minContextSlot);

        setStatus("saving");
        await adapter.commitBanner({
          countryCode: input.countryCode,
          ownerAddress,
          signature,
        });

        void syncNow();
        setStatus("saved");
        return true;
      } catch (caught) {
        setStatus("failed");
        setError(
          caught instanceof WalletError || caught instanceof BoardError
            ? caught.message
            : caught instanceof BoardNetworkError
              ? "Couldn't reach the server. Your banner wasn't saved."
              : "Your banner wasn't saved. Try again.",
        );
        return false;
      }
    },
    [adapter, syncNow, wallet],
  );

  return { status, error, save, reset };
}
