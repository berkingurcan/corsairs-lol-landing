"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DESTINATIONS, isActive } from "./nav";
import { MapIcon, PersonIcon, PulseIcon } from "./icons";

const ICONS = { map: MapIcon, pulse: PulseIcon, person: PersonIcon };

/**
 * The same three destinations in two places.
 *
 * `place` decides the furniture, not the content: the bar renders them as
 * pills beside the lockup, the tab bar as icons over labels along the bottom
 * edge. Both are hidden by the other's breakpoint in app.css, so only one is
 * ever on screen and a screen reader is only offered one of them.
 */
export function AppNav({ place }: { place: "bar" | "tabs" }) {
  const pathname = usePathname();

  return (
    // Only one of the two is ever displayed — app.css hides the other at its
    // breakpoint, which takes it out of the accessibility tree too, so the
    // shared label is never announced twice.
    <nav className={place === "bar" ? "ab-nav" : "ab-tabs"} aria-label="Sections">
      {DESTINATIONS.map((d) => {
        const Icon = ICONS[d.icon];
        const current = isActive(d, pathname);
        return (
          <Link key={d.href} href={d.href} aria-current={current ? "page" : undefined}>
            <Icon />
            <span>{d.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
