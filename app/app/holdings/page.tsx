import type { Metadata } from "next";

import { HoldingsBoard } from "@/components/app/HoldingsBoard";

export const metadata: Metadata = { title: "Holdings" };

/**
 * /app/holdings — the wallet, and what it owns.
 *
 * Disconnected, this is not an empty state with a connect button in the middle
 * of it. It shows the board's aggregate with the wallet section inert above:
 * there is something to look at before there is a wallet, and someone who has
 * not connected one is exactly the reader who needs a reason to.
 */
export default function HoldingsPage() {
  return (
    <div className="ab-page">
      <header className="ab-page-head">
        <h1>Holdings</h1>
        <p>
          Your balance, the countries you hold and what each would cost to take from
          you, realised profit, and the captains who took one back.
        </p>
      </header>

      <HoldingsBoard />
    </div>
  );
}
