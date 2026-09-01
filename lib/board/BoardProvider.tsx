"use client";

/**
 * The board, held once for the whole app.
 *
 * Every screen reads from here and none of them knows whether the rows are
 * real. The adapter is chosen in `current.ts` and nowhere else — that is the
 * entire cost of going live, and it is only that cheap because the seam was
 * built before anything was written against it.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { POLL_INTERVAL_HIDDEN_MS, POLL_INTERVAL_MS } from "./config";
import { BoardError, type BoardAdapter } from "./adapter";
import { adapter } from "./current";
import type { FlipRecord, Territory } from "./types";

export interface BoardContextValue {
  adapter: BoardAdapter;
  /** Keyed by ISO-2. The board is looked up far more often than it is walked. */
  territories: Map<string, Territory>;
  flips: FlipRecord[];
  syncedAt: string | null;
  /** True only before the first response. A poll failure is not a loading state. */
  loading: boolean;
  /** Last sync failure. The board keeps rendering what it has. */
  error: BoardError | null;
  /** Incremental. Safe to call as often as you like. */
  syncNow(): Promise<void>;
  /** Full re-read, ignoring `since`. For a manual retry. */
  refresh(): Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

/**
 * Which of two rows for the same country is newer.
 *
 * `version` is bumped by the server on every ownership change and exists for
 * exactly this: `claimedAt` cannot decide it, because two takeovers can land
 * in the same millisecond. Falls back to `claimedAt` for a row that predates
 * the field, and to "the incoming one" when neither says anything — a response
 * we just asked for is a better guess than a cache.
 */
function isNewer(incoming: Territory, existing: Territory): boolean {
  if (typeof incoming.version === "number" && typeof existing.version === "number") {
    return incoming.version >= existing.version;
  }
  if (incoming.claimedAt !== null && existing.claimedAt !== null) {
    return incoming.claimedAt >= existing.claimedAt;
  }
  return true;
}

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [territories, setTerritories] = useState<Map<string, Territory>>(() => new Map());
  const [flips, setFlips] = useState<FlipRecord[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<BoardError | null>(null);

  // Kept in refs as well as state: the poll reads them without wanting to be
  // rebuilt every time they change, and two overlapping syncs would otherwise
  // both send the same `since`.
  const syncedAtRef = useRef<string | null>(null);
  const inFlight = useRef(false);

  const sync = useCallback(async (full: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const since = full ? null : syncedAtRef.current;
      const state = await adapter.getState(since);

      setTerritories((current) => {
        // A full response replaces; a partial one merges, because it only
        // carries what moved.
        const next = state.partial ? new Map(current) : new Map<string, Territory>();
        for (const territory of state.territories) {
          const existing = next.get(territory.countryCode);
          if (!existing || isNewer(territory, existing)) {
            next.set(territory.countryCode, territory);
          }
        }
        return next;
      });

      // Flips arrive newest-first and the endpoint returns a bounded window,
      // so a partial response's list is authoritative for that window rather
      // than something to append to.
      if (state.flips.length > 0 || !state.partial) setFlips(state.flips);

      syncedAtRef.current = state.syncedAt;
      setSyncedAt(state.syncedAt);
      setError(null);
    } catch (caught) {
      // The board keeps rendering what it has. A poll that failed is a stale
      // board, not an empty one, and blanking the map on a dropped request is
      // how a momentary tunnel looks like a lost country.
      setError(
        caught instanceof BoardError
          ? caught
          : new BoardError("Couldn't refresh the board."),
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  const syncNow = useCallback(() => sync(false), [sync]);
  const refresh = useCallback(() => sync(true), [sync]);

  useEffect(() => {
    void sync(true);

    let timer: ReturnType<typeof setInterval>;

    // Slowed while the tab is hidden rather than stopped: a board that is
    // minutes stale on return shows countries someone no longer owns. But
    // nobody is looking at it, so the ten-second cadence buys nothing.
    const schedule = () => {
      clearInterval(timer);
      timer = setInterval(
        () => void sync(false),
        document.hidden ? POLL_INTERVAL_HIDDEN_MS : POLL_INTERVAL_MS,
      );
    };

    const onVisibility = () => {
      // Re-sync the instant the tab comes back, before the new interval's
      // first tick — that wait is the one a returning reader would notice.
      if (!document.hidden) void sync(false);
      schedule();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sync]);

  const value = useMemo<BoardContextValue>(
    () => ({ adapter, territories, flips, syncedAt, loading, error, syncNow, refresh }),
    [territories, flips, syncedAt, loading, error, syncNow, refresh],
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used inside <BoardProvider>.");
  return context;
}

/** One country, or undefined before the first sync lands. */
export function useTerritory(countryCode: string | null): Territory | undefined {
  const { territories } = useBoard();
  return countryCode ? territories.get(countryCode) : undefined;
}
