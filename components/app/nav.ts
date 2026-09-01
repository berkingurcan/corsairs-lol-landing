/**
 * The app's destinations, in the phone's tab order.
 *
 * One list feeds the top bar and the bottom tab bar, so the two can never
 * disagree about what exists or in what order. Labels are the browser's, not
 * the phone's: "Board" rather than "Map" because the page has an address and a
 * title bar to fill, and "Holdings" rather than "Profile" because there is no
 * profile — there is a wallet and what it owns.
 */
export type Destination = {
  href: string;
  label: string;
  icon: "map" | "pulse" | "person";
  /** Sub-paths that keep this destination lit. */
  owns?: string;
};

export const DESTINATIONS: Destination[] = [
  { href: "/app", label: "Board", icon: "map", owns: "/app/c" },
  { href: "/app/activity", label: "Activity", icon: "pulse" },
  { href: "/app/holdings", label: "Holdings", icon: "person" },
];

/** A country page is reached from the board and belongs to it. */
export function isActive(dest: Destination, pathname: string): boolean {
  if (pathname === dest.href) return true;
  if (dest.owns && pathname.startsWith(dest.owns)) return true;
  return dest.href !== "/app" && pathname.startsWith(`${dest.href}/`);
}
