import Link from "next/link";

import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#banner", label: "The banner" },
  { href: "/#economics", label: "Economics" },
];

export function SiteHeader() {
  return (
    <header className="nav">
      <div className="shell nav-in">
        <Link className="lockup" href="/" aria-label="corsairs.lol home">
          <Mark className="mark" />
          <span>corsairs.lol</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-end">
          <ThemeToggle />
          {/* The board takes the header's one CTA slot, because it is the only
              thing up here that is a destination rather than a section. X keeps
              the solid button in the hero and the closer, and its own line in
              the footer — it loses the header, not its prominence. The full
              hierarchy swap comes when the board has real data behind it. */}
          <Link className="btn btn-ghost nav-cta" href="/app">
            Open the app
          </Link>
        </div>
      </div>
    </header>
  );
}
