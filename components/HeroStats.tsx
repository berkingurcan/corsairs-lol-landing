import type { ReactNode } from "react";

import { game } from "@/lib/site";

/**
 * The three figures under the hero.
 *
 * No directive on this file on purpose. It is rendered from the server on a
 * board that is not live yet and from a client island on one that is, and a
 * `"use client"` here would drag the static branch into the browser bundle for
 * three pieces of text that never change.
 */
export interface Stat {
  /** A node rather than a string so a live figure can carry its `<time>`. */
  value: ReactNode;
  label: string;
  /** Accent colour. Money only — it is the page's one signal for a price. */
  price?: boolean;
}

/**
 * What the hero says when there is no board to read.
 *
 * The rules of the game, which are true whether or not anyone is playing it
 * today. That makes this the right fallback for every reason the live figures
 * can be missing — build not live yet, request failed, nothing claimed — and
 * it is why nothing below ever renders an empty slot or a dash.
 */
export const RULE_STATS: Stat[] = [
  { value: game.countries, label: "countries" },
  { value: game.basePrice, label: "SOL to open one", price: true },
  { value: "+20%", label: "to take one" },
];

export function StatList({ stats }: { stats: Stat[] }) {
  return (
    <ul className="shell hero-stats" aria-label="At a glance">
      {stats.map((stat) => (
        <li key={stat.label}>
          <span className={stat.price ? "stat-n price" : "stat-n"}>{stat.value}</span>
          <span className="stat-l">{stat.label}</span>
        </li>
      ))}
    </ul>
  );
}
