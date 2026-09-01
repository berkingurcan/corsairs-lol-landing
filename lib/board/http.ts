/**
 * The real adapter.
 *
 * Transport only, ported straight from `src/services/apiClient.ts` — the same
 * endpoints, the same headers, the same error mapping — so that switching
 * `BoardProvider` over is genuinely one line. What it does NOT yet have is the
 * transaction check, and that is deliberate: see `assertIntentIsSafe` below.
 *
 * ── On keys ──
 *
 * The Supabase anon key is public by design. It grants read access to the
 * board and nothing else; every write goes through an Edge Function holding
 * the service role key, which never leaves the server. `NEXT_PUBLIC_` is
 * correct for it.
 *
 * An RPC endpoint's key is NOT. `NEXT_PUBLIC_` is substituted into JavaScript
 * at build time, so anything carrying that prefix is readable by anyone with
 * devtools — the same way `EXPO_PUBLIC_` is readable by anyone who unzips the
 * APK. If this client ever needs its own RPC read (a wallet balance is the
 * only likely one), it goes through a server route that holds the key, and
 * `output: "export"` comes out of next.config.ts to allow that route. Do not
 * solve it by renaming the variable: it will keep working, and it will publish
 * the key.
 */
import {
  BoardError,
  BoardNetworkError,
  BoardNotConfiguredError,
  type BannerDraft,
  type BoardAdapter,
  type BoardState,
  type PurchaseIntent,
  type SettleResponse,
} from "./adapter";
import type { Territory } from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * False when the build has no settlement server. The board still renders from
 * whatever it has, but buying is disabled — an unclaimed map with a working
 * Buy button that records ownership nowhere is worse than no button at all.
 */
const IS_CONFIGURED = Boolean(BASE_URL && ANON_KEY);

/** Long enough for the server's on-chain confirmation retries. */
const REQUEST_TIMEOUT_MS = 30_000;

async function request<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<T> {
  if (!IS_CONFIGURED) throw new BoardNotConfiguredError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        // Supabase Edge Functions verify this before the handler runs.
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new BoardNetworkError(
      (error as { name?: string })?.name === "AbortError"
        ? "The server took too long to answer."
        : "Couldn't reach the server. Check your connection.",
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: { error?: { code?: string; message?: string } } | null = null;
  try {
    payload = await response.json();
  } catch {
    // A body-less response is only acceptable on success.
  }

  // 202 is a success: /settle uses it for "paid, not confirmed yet", which
  // `response.ok` already covers. Every non-2xx carries a player-facing
  // message, so `BoardError.message` goes straight on screen.
  if (!response.ok) {
    throw new BoardError(
      payload?.error?.message || `Request failed (${response.status}).`,
      payload?.error?.code || "error",
      response.status,
    );
  }

  return payload as T;
}

export const httpAdapter: BoardAdapter = {
  kind: "http",
  canSettle: IS_CONFIGURED,

  getState(since) {
    const query = since ? `?since=${encodeURIComponent(since)}` : "";
    return request<BoardState>(`/state${query}`);
  },

  createIntent(params) {
    return request<PurchaseIntent>("/intent", { method: "POST", body: params });
  },

  async releaseIntent(params) {
    await request<{ released: boolean }>("/intent", {
      method: "POST",
      body: { ...params, action: "release" },
    });
  },

  assertIntentIsSafe() {
    /**
     * NOT IMPLEMENTED — and it fails closed rather than passing silently.
     *
     * The server sets the price, but that is no reason to sign its bytes
     * unread. The implementation is `assertTransactionMatchesQuote` in the app
     * repo's apiClient: decode the base64 with `VersionedTransaction`, then
     * assert it moves exactly `intent.priceLamports` out of `buyerAddress` and
     * does nothing else, throwing `TransactionMismatchError` otherwise. Without
     * it, a tampered or swapped response can get a wallet drain approved under
     * the label of a country.
     *
     * Throwing here is the point. The alternative — an empty body, like the
     * mock's — would let this adapter go live with the check quietly absent,
     * and nothing on screen would look wrong until it mattered.
     */
    throw new BoardError(
      "This build can't verify what it is signing, so it won't sign it.",
      "not_implemented",
    );
  },

  settle(params) {
    return request<SettleResponse>("/settle", { method: "POST", body: params });
  },

  prepareBanner(params) {
    return request<BannerDraft>("/banner", {
      method: "POST",
      body: { ...params, action: "prepare" },
    });
  },

  commitBanner(params) {
    return request<{ territory: Territory | null }>("/banner", {
      method: "POST",
      body: { ...params, action: "commit" },
    });
  },
};
