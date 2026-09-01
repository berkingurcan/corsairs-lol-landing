/**
 * /app — the board, in a browser.
 *
 * A separate token set and a separate shell from the marketing pages, in the
 * same deploy: one copy of the 195 countries, one copy of the map geometry,
 * one build. `app.corsairs.lol` arrives later as a rewrite onto these same
 * paths, which is why nothing here assumes it is at the root.
 */
import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/app/AppShell";
import "./tokens.css";
import "./app.css";

export const metadata: Metadata = {
  title: {
    default: "The board — corsairs.lol",
    template: "%s — corsairs.lol",
  },
  // The board is a client surface over live state; there is nothing for a
  // crawler to index here that the marketing pages do not say better. The
  // country pages under /app/c opt back in individually.
  robots: { index: false, follow: true },
};

/**
 * The app commits to one theme, so it overrides the root layout's pair. Without
 * this the browser paints its own chrome — the address bar on Android, the
 * scrollbars — from the marketing palette, and a light-mode reader gets a white
 * frame around a near-black board.
 */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050606",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
