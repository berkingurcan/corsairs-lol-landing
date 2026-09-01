"use client";

/**
 * Find a country.
 *
 * 195 destinations on a 2000x800 sheet is more than anyone should have to pan
 * for, and it is the one thing a browser can offer that the phone's board
 * cannot. ⌘K because that is where a keyboard reaches for it.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { COUNTRIES } from "@/lib/countries";
import type { Territory } from "@/lib/board/types";
import { formatPrice, getPriceToTake } from "@/lib/board/config";

export function BoardSearch({
  territories,
  onPick,
  onClose,
}: {
  territories: Map<string, Territory>;
  onPick(iso2: string): void;
  onClose(): void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /**
   * Take focus, and give it back.
   *
   * The finder is opened from the keyboard as often as from the chip, so the
   * place focus came from is the place it has to return to — otherwise ⌘K,
   * Escape leaves you at the top of the document with the map you were
   * reading still on screen.
   */
  useEffect(() => {
    const from = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => from?.focus?.();
  }, []);

  /** Tab stays inside the dialog while the dialog is over everything else. */
  const onTrapKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'input, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? COUNTRIES.filter(
          (c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase() === q,
        )
      : COUNTRIES;
    // A leading match is what someone typing three letters meant, so it sorts
    // above a country that merely contains them.
    return [...pool]
      .sort((a, b) => {
        const al = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bl = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return al - bl || a.name.localeCompare(b.name);
      })
      .slice(0, 40);
  }, [query]);

  useEffect(() => setCursor(0), [query]);

  // Keep the highlighted row in view when it moves by keyboard.
  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div className="ab-search-scrim" onPointerDown={onClose}>
      <div
        className="ab-search"
        role="dialog"
        aria-modal="true"
        aria-label="Find a country"
        onKeyDown={onTrapKey}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="ab-search-input"
          type="text"
          placeholder="Find a country"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") return onClose();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === "Enter" && results[cursor]) {
              e.preventDefault();
              onPick(results[cursor].iso2);
            }
          }}
        />

        <ul className="ab-search-list" ref={listRef}>
          {results.map((country, i) => {
            const territory = territories.get(country.iso2);
            const claimed = Boolean(territory?.isClaimed);
            return (
              <li key={country.iso2}>
                <button
                  type="button"
                  className={"ab-search-row" + (i === cursor ? " is-cursor" : "")}
                  onPointerEnter={() => setCursor(i)}
                  onClick={() => onPick(country.iso2)}
                >
                  <span className="ab-search-flag" aria-hidden="true">
                    {country.flag}
                  </span>
                  <span className="ab-search-name">{country.name}</span>
                  {claimed && territory?.color && (
                    <span
                      className="ab-owner-dot"
                      style={{ background: territory.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="ab-value">
                    {territory ? formatPrice(getPriceToTake(territory)) : "—"}
                  </span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="ab-search-empty">No country by that name.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
