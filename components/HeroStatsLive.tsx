"use client";

import { formatAmount, timeAgo } from "@/lib/board/config";
import { useSnapshot } from "@/lib/board/useSnapshot";

import { RULE_STATS, StatList, type Stat } from "./HeroStats";

/**
 * The hero figures, read off the live board.
 *
 * Slot by slot, not all or nothing. Each of the three falls back to its rule
 * from `RULE_STATS` independently, so a board with nobody on it yet shows
 * "195 countries" where it would otherwise show how many are held, and keeps
 * the two figures it does have. The alternative — one missing number blanking
 * the row — is how an empty board looks like a broken page.
 *
 * Rendered on the server first with the rules already in it, so the row is
 * complete at first paint, does not move when the read lands, and is still
 * correct with JavaScript switched off.
 */
export function HeroStatsLive() {
  const snapshot = useSnapshot();
  const [countries, opening, takeover] = RULE_STATS;

  const stats: Stat[] = [
    snapshot
      ? { value: snapshot.claimed, label: `of ${snapshot.total} held` }
      : countries,

    snapshot?.top
      ? { value: formatAmount(snapshot.top.price), label: "SOL to take the top one", price: true }
      : opening,

    // `timeAgo` is resolved once, when the read lands, because this page does
    // not poll — so the figure is as of arrival and says so in its own markup.
    // The `<time>` carries the absolute instant, which stays true however long
    // the tab is left open.
    snapshot?.lastTakeoverAt
      ? {
          value: (
            <time
              dateTime={new Date(snapshot.lastTakeoverAt).toISOString()}
              title={new Date(snapshot.lastTakeoverAt).toLocaleString()}
            >
              {timeAgo(snapshot.lastTakeoverAt)}
            </time>
          ),
          label: "last takeover",
        }
      : takeover,
  ];

  return <StatList stats={stats} />;
}
