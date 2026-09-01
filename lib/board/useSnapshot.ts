"use client";

import { useEffect, useState } from "react";

import { readSnapshot, type BoardSnapshot } from "./snapshot";

/**
 * The board snapshot, or null until it lands.
 *
 * Null is the entire error contract on this surface, and that is a decision
 * rather than an omission. A marketing page that cannot reach the board should
 * print the rules of the game — which are true whatever the board is doing —
 * not a retry button, not a spinner, and not an apology to a reader who never
 * asked it a question. Every caller falls back figure by figure, so a board
 * with nothing claimed on it degrades exactly like a board that is unreachable.
 */
export function useSnapshot(): BoardSnapshot | null {
  const [snapshot, setSnapshot] = useState<BoardSnapshot | null>(null);

  useEffect(() => {
    let live = true;
    readSnapshot().then(
      (value) => {
        if (live) setSnapshot(value);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);

  return snapshot;
}
