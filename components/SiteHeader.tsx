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
              a button in the closer and its own line in the footer — it loses
              the primary slot, not its place.

              Solid, while the board is still mock-fed, on purpose: the board
              says what it is the moment it loads (`NetworkBadge`, in the
              warning colour). That is the difference between this button and
              the /t share links, which name one country and would imply a real
              price for it — see `boardIsLive` in lib/site.ts. */}
          <Link className="btn btn-solid nav-cta" href="/app">
            Open the board
          </Link>
        </div>
      </div>
    </header>
  );
}
