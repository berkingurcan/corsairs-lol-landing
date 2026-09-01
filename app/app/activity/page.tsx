import type { Metadata } from "next";

import { ActivityBoard } from "@/components/app/ActivityBoard";

export const metadata: Metadata = { title: "Activity" };

/**
 * /app/activity — the board by price.
 *
 * Ordered by price and not by time, one row per country rather than one per
 * takeover. The reasoning is load-bearing: these rows are advertisements
 * someone paid for, so the ordering has to be one an advertiser can move
 * themselves up in — and that is exactly what they paid. A chronological feed
 * sells the top slot to whoever acted most recently, which is nothing anyone
 * can buy. Each row still carries the takeover that put its owner there, so it
 * reads as activity.
 */
export default function ActivityPage() {
  return (
    <div className="ab-page">
      <header className="ab-page-head">
        <h1>Activity</h1>
        <p>
          The board ordered by what it cost, most expensive first — with the takeover
          that put each captain there, and who holds the most.
        </p>
      </header>

      <ActivityBoard />
    </div>
  );
}
