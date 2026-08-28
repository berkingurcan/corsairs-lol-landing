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
        <nav className="foot-links" aria-label="Footer">
          <Link href="/#how">How it works</Link>
          <Link href="/#economics">Economics</Link>
          <a href={site.x} rel="me noopener">
            X
          </a>
        </nav>
        <p className="foot-note">
          {/* Static export, so this is the build year — which is the year the
              copy was last true anyway. */}
          © {new Date().getFullYear()} corsairs.lol · A mobile game for Solana Seeker
          and Android. Every price on the board is real SOL on mainnet.
        </p>
      </div>
    </footer>
  );
}
