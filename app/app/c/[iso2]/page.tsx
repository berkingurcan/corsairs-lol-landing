/**
 * /app/c/<ISO2> — a country, addressable.
 *
 * The route the phone has no equivalent of, and the reason the web client is
 * worth building: a browser has URLs. This is where a share link lands and
 * where the social card is generated.
 *
 * It is deliberately not the same page as /t/<ISO2>. Those are CDN-static and
 * therefore print no price, because the board moves every few seconds and a
 * number baked into a file would be wrong more often than right. This one is
 * client-hydrated from the board's own state, so it can show a live price —
 * and once it does, /t/<ISO2> starts redirecting here.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryLive } from "@/components/app/board/CountryLive";
import { COUNTRIES, getCountryByIso2 } from "@/lib/countries";
import { boardIsLive, game, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ iso2: c.iso2 }));
}

type Props = { params: Promise<{ iso2: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso2 } = await params;
  const country = getCountryByIso2(iso2);
  if (!country) return {};

  const title = `${country.name} — corsairs.lol`;
  const description = `Who holds ${country.name}, what their banner says, and what it costs to take it. One of ${game.countries} countries on the corsairs.lol board.`;

  return {
    title: country.name,
    description,
    // One indexed page per country. While the board is mock-fed that is
    // /t/<ISO2>, which is honest about knowing no price; once it is live it is
    // this one, which shows a real one. See `boardIsLive`.
    robots: { index: boardIsLive, follow: true },
    alternates: { canonical: `/app/c/${country.iso2}` },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: `${site.url}/app/c/${country.iso2}`,
      title,
      description,
      images: [{ url: "/assets/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      site: site.xHandle,
      title,
      description,
      images: ["/assets/og.png"],
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { iso2 } = await params;
  const country = getCountryByIso2(iso2);
  if (!country) notFound();

  return (
    <div className="ab-page">
      <header className="ab-page-head">
        <div className="ab-stack">
          <span className="ab-label">
            {country.continent} · {country.iso3}
          </span>
          <h1>
            <span className="ab-flag" aria-hidden="true">
              {country.flag}
            </span>
            {country.name}
          </h1>
        </div>
        <p>
          One of {game.countries} countries on the board. It opens at{" "}
          {game.basePrice.toFixed(4)} SOL if nobody has taken it, and every takeover
          after that costs at least {Math.round((game.priceMultiplier - 1) * 100)}% more
          than the last.
        </p>
      </header>

      <CountryLive iso2={country.iso2} name={country.name} />
    </div>
  );
}
