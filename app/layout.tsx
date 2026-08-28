import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { site } from "@/lib/site";
import "./globals.css";

/**
 * Display, data and body — the three faces the brand uses.
 *
 * `opsz` is set to the size the type is READ at, not rendered at, which is why
 * the headline sizes carry it explicitly in the stylesheet rather than letting
 * the axis track the pixel size.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["WONK", "opsz"],
  display: "swap",
  variable: "--font-display",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s — corsairs.lol",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: site.title,
    description: site.description,
    images: [{ url: "/assets/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: site.xHandle,
    title: site.title,
    description: site.description,
    images: ["/assets/og.png"],
  },
  icons: {
    icon: "/assets/favicon.svg",
    apple: "/assets/icon-512.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#04090F" },
  ],
};

/**
 * Runs before the first paint, so a reader who chose a theme never sees the
 * other one flash. It is inline on purpose: an external file would be a second
 * round trip, and the flash is exactly as long as that round trip.
 */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The script above sets an attribute the server did not render.
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexMono.variable} ${plexSans.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
