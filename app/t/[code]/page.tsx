/**
 * /t/<ISO2> — where a shared brag lands.
 *
 * `share.ts` in the app builds these links, so every one of the 195 has to
 * resolve. The page deliberately shows no price, owner or banner: this is a
 * static file on a CDN and the board moves every few seconds, so a number
 * printed here would be wrong more often than right. The app is the board.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COUNTRIES, getCountryByIso2 } from "@/lib/countries";
import { game, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: c.iso2 }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = getCountryByIso2(code);
  if (!country) return {};

  const title = `${country.name} — corsairs.lol`;
  const description = `${country.name} is one of ${game.countries} countries on the corsairs.lol map. Capture it, raise your banner, and challenge the next captain.`;

  return {
    title: country.name,
    description,
    alternates: { canonical: `/t/${country.iso2}` },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: `${site.url}/t/${country.iso2}`,
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

export default async function TerritoryPage({ params }: Props) {
  const { code } = await params;
  const country = getCountryByIso2(code);
  if (!country) notFound();

  return (
    <>
      <SiteHeader />

      <main id="main">
        <section className="territory">
          <div className="shell territory-in">
            <p className="kicker">Territory · {country.iso3}</p>

            <h1 className="territory-name">
              <span className="territory-flag" aria-hidden="true">
                {country.flag}
              </span>
              {country.name}
            </h1>

            <p className="lede">
              One of {game.countries} countries on the map. Whoever holds it flies their
              banner on it until another captain pays more.
            </p>

            <div className="cta">
              <a className="btn btn-solid" href={site.store} rel="noopener">
                Open it in the app
              </a>
              <Link className="btn btn-ghost" href="/">
                How the game works
              </Link>
            </div>

            <dl className="specs territory-facts">
              <div>
                <dt>Continent</dt>
                <dd>{country.continent}</dd>
              </div>
              <div>
                <dt>Opening price</dt>
                <dd className="price">
                  {game.basePrice} {game.currency}
                </dd>
              </div>
              <div>
                <dt>Price to take</dt>
                <dd>+20%, at least</dd>
              </div>
              <div>
                <dt>If you are taken</dt>
                <dd>Principal + half the increase</dd>
              </div>
            </dl>

            <p className="fineprint">
              <span className="dot" aria-hidden="true" />
              The live price and the current captain are in the app. This page is a static
              file and the board moves, so it does not pretend to know them.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
