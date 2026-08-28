import Link from "next/link";

import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/site";

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
          <a className="btn btn-ghost nav-cta" href={site.store} rel="noopener">
            Get the app
          </a>
        </div>
      </div>
    </header>
  );
}
