"use client";

/**
 * The wallet seam.
 *
 * Shaped to `@solana/wallet-adapter-react`'s `useWallet()` so the real provider
 * drops in without touching a screen: same names, same nullability, same
 * "connecting is a state, not a promise you await in a component".
 *
 * One deliberate difference. `publicKey` is a base58 STRING here, not a
 * `PublicKey`. Every consumer wants the base58 anyway — it is what goes to the
 * settlement server, what `colorForAddress()` hashes, and what a row renders —
 * so converting once at the boundary is cheaper than importing `@solana/web3.js`
 * into every component that displays an address. The real provider calls
 * `.toBase58()` where this one returns a fixture; nothing above it changes.
 *
 * `signAndSend` mirrors the mobile wallet adapter's method rather than
 * `signTransaction`, because that is the shape settlement needs: the server
 * built the transaction and wants a signature back as fast as possible, and a
 * separate send step is one more place for the tab to close between paying and
 * reporting.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MOCK_BUYER_ADDRESS } from "@/lib/board/mock";
import { consumeMockFailure } from "@/lib/board/mockFailures";

/** A wallet-side failure the player is meant to read. */
export class WalletError extends Error {
  constructor(
    message: string,
    readonly code: "rejected" | "insufficient_balance" | "error" = "error",
  ) {
    super(message);
    this.name = "WalletError";
  }
}

export interface WalletContextValue {
  /** Base58, or null. See the note above on why this is not a `PublicKey`. */
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  /** In SOL. Null while unknown — a failed balance read is a degraded display,
      never a blocked purchase. */
  balance: number | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  /** @returns the transaction signature, base58. */
  signAndSend(transaction: string, minContextSlot: number): Promise<string>;
  refreshBalance(): Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "corsairs.mock.wallet";
const MOCK_BALANCE = 2.4137;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  /**
   * Autoconnect, which is what every real adapter does: a wallet the browser
   * has already authorised should not have to be re-authorised on every route
   * change. Runs after mount rather than during render — the static export has
   * no storage to read at build time, and reading it during render would make
   * the first paint disagree with the HTML.
   */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) {
        setPublicKey(MOCK_BUYER_ADDRESS);
        setBalance(MOCK_BALANCE);
      }
    } catch {
      /* private mode — the connection just does not survive a reload */
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      await sleep(320);
      setPublicKey(MOCK_BUYER_ADDRESS);
      setBalance(MOCK_BALANCE);
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* as above */
      }
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setPublicKey(null);
    setBalance(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* as above */
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    await sleep(180);
    setBalance((current) => current ?? MOCK_BALANCE);
  }, [publicKey]);

  const signAndSend = useCallback(
    async (_transaction: string, _minContextSlot: number) => {
      if (!publicKey) throw new WalletError("No wallet is connected.");

      // Dismissing the wallet is an answer, not a fault — the message says so,
      // and the UI must not dress it as an error the player has to recover
      // from.
      if (consumeMockFailure("rejected_signature")) {
        await sleep(900);
        throw new WalletError("You dismissed the wallet, so nothing was signed.", "rejected");
      }

      if (consumeMockFailure("insufficient_balance")) {
        await sleep(600);
        throw new WalletError(
          "Your wallet doesn't have enough SOL to cover this and the network fee.",
          "insufficient_balance",
        );
      }

      // The wallet is open and someone is reading it. This is the one wait in
      // the flow with a person on the other end of it.
      await sleep(1600);
      return Array.from({ length: 88 }, () =>
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".charAt(
          Math.floor(Math.random() * 58),
        ),
      ).join("");
    },
    [publicKey],
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      publicKey,
      connected: publicKey !== null,
      connecting,
      balance,
      connect,
      disconnect,
      signAndSend,
      refreshBalance,
    }),
    [publicKey, connecting, balance, connect, disconnect, signAndSend, refreshBalance],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside <WalletProvider>.");
  return context;
}
