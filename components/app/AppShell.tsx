import Link from "next/link";

import { BoardProvider } from "@/lib/board/BoardProvider";
import { Mark } from "@/components/Mark";
import { WalletProvider } from "@/lib/wallet/WalletProvider";
import { AppNav } from "./AppNav";
import { NetworkBadge } from "./NetworkBadge";
import { WalletPill } from "./WalletPill";

/**
 * The frame every app route renders inside.
 *
 * `.app-root` is what switches the document into the Dark Bridge token set —
 * tokens.css scopes to it — so nothing inside this element inherits the
 * marketing palette, and nothing outside it is touched.
 *
 * Both providers are mounted here rather than per route: the board is one
 * poll for the whole app, and a wallet that disconnected every time someone
 * opened Activity would be a wallet nobody connects. Wallet sits outside the
 * board so the board can come to depend on who is connected — "your" countries
 * are a property of the board, not of a screen.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <BoardProvider>
        <div className="app-root">
          <header className="ab-bar">
            <Link className="ab-lockup" href="/" aria-label="corsairs.lol — back to the site">
              <Mark />
              <span>corsairs.lol</span>
            </Link>

            <AppNav place="bar" />

            <div className="ab-bar-end">
              <NetworkBadge />
              <WalletPill />
            </div>
          </header>

          {/* globals.css sends the site-wide skip link here. */}
          <main id="main" className="ab-main">
            {children}
          </main>

          <AppNav place="tabs" />
        </div>
      </BoardProvider>
    </WalletProvider>
  );
}
