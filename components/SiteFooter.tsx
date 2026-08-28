import Link from "next/link";

import { Mark } from "./Mark";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="shell foot-in">
        <Link className="lockup" href="/" aria-label="corsairs.lol home">
          <Mark className="mark" />
          <span>corsairs.lol</span>
        </Link>
        <nav className="foot-links" aria-label="Elsewhere">
          <a href={site.x} rel="me noopener">X</a>
          <a href={site.github} rel="noopener">GitHub</a>
          <a href={site.store} rel="noopener">dApp Store</a>
        </nav>
        <p className="foot-note">
          Built for Solana Seeker. Android only — Mobile Wallet Adapter does not exist on iOS.
        </p>
      </div>
    </footer>
  );
}
