/**
 * The failure switch.
 *
 * A mock that only succeeds ships a UI with no error states, and the expensive
 * discovery is finding the middle of the purchase flow when the real API
 * arrives into it. So every branch the settlement path can take is reachable
 * here, on demand, without a rebuild.
 *
 * Two of these are the adapter's and three are the wallet's, which is why the
 * switch is its own module rather than living in either — the flow crosses
 * both, and a tester should not have to know where a given failure originates.
 *
 * Set it from the console (`window.corsairsMock.set("rival_race")`), from the
 * URL (`/app?fail=rival_race`), or from the dev strip once step 4 draws one.
 * The URL wins on load, so a bug report can carry the state that produced it.
 */

export type MockFailure =
  /** A rival reserved the country between the quote and the signature. 409 —
      which lands BEFORE the wallet opens, so there is no payment to unwind. */
  | "rival_race"
  /** The server quotes above what the button said. Must stop and ask. */
  | "stale_price"
  /** Connection lost after signing. NOT a failed purchase. */
  | "network_drop"
  /** The player dismissed the wallet. An answer, not a fault. */
  | "rejected_signature"
  /** The wallet cannot cover the price plus fees. */
  | "insufficient_balance";

export const MOCK_FAILURES: { value: MockFailure; label: string }[] = [
  { value: "rival_race", label: "Rival took it mid-purchase" },
  { value: "stale_price", label: "Price moved before signing" },
  { value: "network_drop", label: "Connection lost after signing" },
  { value: "rejected_signature", label: "Wallet dismissed" },
  { value: "insufficient_balance", label: "Not enough SOL" },
];

const STORAGE_KEY = "corsairs.mock.failure";

let armed: MockFailure | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function isFailure(value: unknown): value is MockFailure {
  return MOCK_FAILURES.some((f) => f.value === value);
}

/**
 * Reads the URL first and storage second, once, on the first access from a
 * browser. Deferred rather than done at import time because this module is
 * pulled in during the static export, where there is no `window` and nothing
 * to read.
 */
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  const fromUrl = new URLSearchParams(window.location.search).get("fail");
  if (isFailure(fromUrl)) {
    armed = fromUrl;
    return;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isFailure(stored)) armed = stored;
  } catch {
    /* private mode — the switch just does not survive a reload */
  }
}

export function getMockFailure(): MockFailure | null {
  hydrate();
  return armed;
}

/** True when this failure is armed, and disarms it. Each one fires once. */
export function consumeMockFailure(failure: MockFailure): boolean {
  if (getMockFailure() !== failure) return false;
  setMockFailure(null);
  return true;
}

export function setMockFailure(failure: MockFailure | null) {
  hydrated = true;
  armed = failure;
  try {
    if (failure) window.localStorage.setItem(STORAGE_KEY, failure);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* as above */
  }
  listeners.forEach((fn) => fn());
}

/** For `useSyncExternalStore`, so a dev strip can render the armed state. */
export function subscribeMockFailure(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== "undefined") {
  (window as unknown as { corsairsMock: unknown }).corsairsMock = {
    get: getMockFailure,
    set: setMockFailure,
    list: MOCK_FAILURES.map((f) => f.value),
  };
}
