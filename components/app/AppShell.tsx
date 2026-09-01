import Link from "next/link";

import { Mark } from "@/components/Mark";
import { AppNav } from "./AppNav";
import { WalletPill } from "./WalletPill";

/**
 * The frame every app route renders inside.
 *
 * `.app-root` is what switches the document into the Dark Bridge token set —
 * tokens.css scopes to it — so nothing inside this element inherits the
 * marketing palette, and nothing outside it is touched.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <header className="ab-bar">
        <Link className="ab-lockup" href="/" aria-label="corsairs.lol — back to the site">
          <Mark />
          <span>corsairs.lol</span>
        </Link>

        <AppNav place="bar" />

        <div className="ab-bar-end">
          {/* Every price on the board is real SOL, so the network is stated
              rather than assumed. */}
          <span className="ab-net">Mainnet</span>
          <WalletPill />
        </div>
      </header>

      {/* globals.css sends the site-wide skip link here. */}
      <main id="main" className="ab-main">
        {children}
      </main>

      <AppNav place="tabs" />
    </div>
  );
}
