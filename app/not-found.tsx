import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Next already emits the noindex tag for this route; only the title is ours.
export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="territory">
          <div className="shell territory-in">
            <p className="kicker">404</p>
            <h1 className="territory-name">Uncharted water.</h1>
            <p className="lede">
              There is no country here. There are 195 of them on the map, and every one
              can change hands.
            </p>
            <div className="cta">
              <Link className="btn btn-solid" href="/">
                Back to the map
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
