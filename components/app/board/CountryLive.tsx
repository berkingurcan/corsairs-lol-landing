"use client";

/**
 * The live half of a country page.
 *
 * The page around this is a static file — 195 of them, one per ISO-2, built at
 * deploy time so a share link lands on something with the right name, flag and
 * social card even before any JavaScript runs. What it deliberately does NOT
 * bake in is a price, because the board moves and a number in a static file
 * would be wrong more often than right. That is the whole difference between
 * this page and /t/<ISO2>: the price here is read from the board after the
 * page has loaded.
 */
import Link from "next/link";
import { useMemo } from "react";

import { useBoard } from "@/lib/board/BoardProvider";
import {
  formatAmount,
  formatPrice,
  getExplorerUrl,
  getPriceToTake,
  shortenAddress,
  timeAgo,
} from "@/lib/board/config";
import { useWallet } from "@/lib/wallet/WalletProvider";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CountryLive({ iso2, name }: { iso2: string; name: string }) {
  const { territories, flips, loading } = useBoard();
  const { publicKey } = useWallet();

  const territory = territories.get(iso2);
  const history = useMemo(
    () =>
      flips
        .filter((f) => f.countryCode === iso2)
        .sort((a, b) => b.timestamp - a.timestamp),
    [flips, iso2],
  );

  const claimed = Boolean(territory?.isClaimed);
  const mine = Boolean(publicKey && territory?.ownerAddress === publicKey);
  const price = territory ? getPriceToTake(territory) : null;

  return (
    <div className="ab-grid-lg">
      <section className="ab-panel">
        <div className="ab-stack">
          <span className="ab-label">
            {loading ? "Reading the board" : claimed ? "Price to take" : "Opening price"}
          </span>
          <span className="ab-figure">
            {price === null ? "—" : formatAmount(price)}
          </span>
          <span className="ab-caption">SOL</span>
        </div>

        {!loading && (
          <dl className="ab-facts ab-facts-tight" style={{ marginTop: "var(--s-xl)" }}>
            <div>
              <dt className="ab-label">Captain</dt>
              <dd>
                {territory?.ownerAddress ? (
                  <>
                    <span
                      className="ab-owner-dot"
                      style={{ background: territory.color }}
                      aria-hidden="true"
                    />
                    <a
                      className="ab-mono"
                      href={getExplorerUrl(`address/${territory.ownerAddress}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenAddress(territory.ownerAddress)}
                    </a>
                    {mine && <span className="ab-row-mine">Yours</span>}
                  </>
                ) : (
                  <span className="ab-muted">Nobody yet</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="ab-label">Held since</dt>
              <dd className="ab-value">
                {territory?.claimedAt ? dateFormat.format(territory.claimedAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="ab-label">Times taken</dt>
              <dd className="ab-value">{territory?.flipCount ?? 0}</dd>
            </div>
          </dl>
        )}

        <Link
          className="ab-btn ab-btn-primary ab-btn-block"
          href={`/app?c=${iso2}`}
          style={{ marginTop: "var(--s-xl)" }}
        >
          {claimed ? `Take ${name} on the board` : `Claim ${name}`}
        </Link>
      </section>

      {/* The banner, as the object it is. */}
      {territory?.hasCustomBanner && (
        <section>
          <h2 className="ab-section-head">The banner</h2>
          <figure className="ab-banner">
            <p className="ab-banner-title">{territory.title}</p>
            {territory.tagline && <p className="ab-banner-tagline">{territory.tagline}</p>}
            {territory.link && <p className="ab-banner-link">{territory.link}</p>}
          </figure>
        </section>
      )}

      {/* The chain of hands. Bounded by the window the board carries, so it
          says how many takeovers there have been rather than implying that
          what is listed is all of them. */}
      {history.length > 0 && (
        <section>
          <h2 className="ab-section-head">Hands it has passed through</h2>
          <ol className="ab-rows">
            {history.map((flip) => (
              <li key={flip.txSignature}>
                <a
                  className="ab-row"
                  href={getExplorerUrl(`tx/${flip.txSignature}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="ab-row-main">
                    <span className="ab-row-title">
                      {flip.previousOwner
                        ? `${shortenAddress(flip.newOwner)} took it from ${shortenAddress(flip.previousOwner)}`
                        : `${shortenAddress(flip.newOwner)} claimed it first`}
                    </span>
                    <span className="ab-row-meta">
                      {timeAgo(flip.timestamp)}
                      {flip.previousOwner && (
                        <> · {formatPrice(flip.previousOwnerPayout)} to the captain displaced</>
                      )}
                    </span>
                  </span>
                  <span className="ab-row-figures">
                    <span className="ab-value">{formatAmount(flip.newPrice)}</span>
                    <span className="ab-row-sub">paid</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          {territory && territory.flipCount > history.length && (
            <p className="ab-buy-foot">
              Showing the {history.length === 1 ? "one takeover" : `${history.length} takeovers`} the
              board is carrying. {name} has changed hands {territory.flipCount} times.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
