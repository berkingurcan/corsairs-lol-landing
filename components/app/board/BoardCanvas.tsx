"use client";

/**
 * The board route's own shell: map, lens, search, inspector.
 *
 * This is the only module allowed to reach the map geometry, and it reaches it
 * lazily. `lib/map/geometry.ts` is ~120 KB; a static import here would put it
 * in a chunk the marketing pages also load, where nothing reads it. The
 * dynamic import is what keeps that 120 KB on the one route that draws it.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBoard } from "@/lib/board/BoardProvider";
import { usePurchase } from "@/lib/board/usePurchase";
import { getCountryByIso2 } from "@/lib/countries";
import { useWallet } from "@/lib/wallet/WalletProvider";

import { BoardSearch } from "./BoardSearch";
import { CountryPanel } from "./CountryPanel";
import type { BoardFilter, WorldMapHandle } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => (
    <div className="ab-map-loading">
      <span className="ab-label">Drawing the board</span>
    </div>
  ),
});

const LENSES: { value: BoardFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "claimed", label: "Held" },
  { value: "mine", label: "Mine" },
];

/** Statuses where the selection is not the player's to change. */
const BUSY: string[] = ["quoting", "confirming-price", "awaiting-signature", "settling"];

export function BoardCanvas() {
  const { territories, loading } = useBoard();
  const { publicKey } = useWallet();
  const purchase = usePurchase();

  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [searchOpen, setSearchOpen] = useState(false);

  const mapRef = useRef<WorldMapHandle | null>(null);
  /** A country to frame as soon as the map chunk has loaded. */
  const pendingFocus = useRef<string | null>(null);

  /**
   * A share link lands here as `/app?c=PT`.
   *
   * Read straight off `location` rather than through `useSearchParams`, which
   * under `output: "export"` would drag this route into a Suspense boundary
   * for what is a single read on mount. Nothing re-reads it: someone who
   * selects another country has moved on from the link that brought them.
   */
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("c")?.toUpperCase();
    if (!code || !getCountryByIso2(code)) return;
    setSelected(code);
    pendingFocus.current = code;
    mapRef.current?.flyTo(code);
  }, []);

  const onMapReady = useCallback(() => {
    if (!pendingFocus.current) return;
    mapRef.current?.flyTo(pendingFocus.current);
    pendingFocus.current = null;
  }, []);

  // ⌘K / Ctrl+K, which is where a keyboard reaches for a finder.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * A purchase in flight pins the board.
   *
   * Once the server has reserved a country — and certainly once the wallet is
   * open — clicking somewhere else cannot be allowed to swap the panel out
   * from under it. You do not get to shop while your wallet is open, and a
   * settling purchase that scrolled off screen is how someone concludes their
   * money vanished.
   */
  const busy = BUSY.includes(purchase.status);

  const select = useCallback(
    (iso2: string | null) => {
      if (busy) return;
      setSelected(iso2);
    },
    [busy],
  );

  const pick = useCallback(
    (iso2: string) => {
      if (busy) return;
      setSelected(iso2);
      setSearchOpen(false);
      mapRef.current?.flyTo(iso2);
    },
    [busy],
  );

  const held = useMemo(
    () => [...territories.values()].filter((t) => t.isClaimed).length,
    [territories],
  );

  return (
    <div className="ab-board">
      <div className="ab-board-canvas">
        <WorldMap
          territories={territories}
          selected={selected}
          mine={publicKey}
          filter={filter}
          onSelect={select}
          handleRef={mapRef}
          onReady={onMapReady}
        />

        {/* Readouts top-left, per the phone's reach rule translated to a
            pointer: what you read first is where the eye starts. */}
        <div className="ab-board-topleft">
          <span className="ab-stat">
            <b>{loading ? "—" : held}</b> of {territories.size || 195} held
          </span>

          <div className="ab-lens" role="group" aria-label="Show">
            {LENSES.map((lens) => (
              <button
                key={lens.value}
                type="button"
                className={"ab-chip" + (filter === lens.value ? " is-on" : "")}
                // Nothing to filter to when there is no wallet, and a chip that
                // empties the board is worse than one that is plainly not ready.
                disabled={lens.value === "mine" && !publicKey}
                aria-pressed={filter === lens.value}
                onClick={() => setFilter(lens.value)}
              >
                {lens.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="ab-chip ab-board-search"
          onClick={() => setSearchOpen(true)}
        >
          Find a country
          <kbd>⌘K</kbd>
        </button>
      </div>

      {/* On a wide screen this is a column; below 860px `is-open` lifts it into
          a sheet along the bottom edge, which is the phone's own furniture. */}
      <aside
        className={"ab-board-side" + (selected ? " is-open" : "")}
        aria-label="Country inspector"
      >
        <CountryPanel
          iso2={selected}
          territory={selected ? territories.get(selected) : undefined}
          mine={publicKey}
          purchase={purchase}
        />
      </aside>

      {searchOpen && (
        <BoardSearch
          territories={territories}
          onPick={pick}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
