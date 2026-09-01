"use client";

/**
 * The inspector's readouts.
 *
 * On a wide screen this is a persistent panel rather than the phone's bottom
 * sheet — there is no reason to hide a country behind a sheet here, and
 * keeping it mounted makes selecting a second country a content swap rather
 * than a dismiss-and-present. Below 860px the same content, in the same order,
 * sits in a sheet along the bottom edge.
 *
 * Readouts only, for now. The purchase — the bid field, the six states, the
 * price-moved confirmation — lands in the space marked at the bottom, which is
 * where the phone's reach rule puts it: readouts top, actions in the bottom
 * third.
 */
import { getCountryByIso2 } from "@/lib/countries";
import {
  calculateProfitSplit,
  formatAmount,
  formatPrice,
  getPriceToTake,
  shortenAddress,
} from "@/lib/board/config";
import type { Territory } from "@/lib/board/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CountryPanel({
  iso2,
  territory,
  mine,
}: {
  iso2: string | null;
  territory: Territory | undefined;
  mine: string | null;
}) {
  if (!iso2) {
    return (
      <div className="ab-panel-empty">
        <div className="ab-stack">
          <span className="ab-label">No selection</span>
          <h3>Pick a country.</h3>
        </div>
        <p className="ab-caption">
          Every one of the 195 is for sale. Choosing one shows who holds it, what their
          banner says, what it costs to take, and what the captain you displace walks
          away with.
        </p>
      </div>
    );
  }

  const country = getCountryByIso2(iso2);
  const claimed = Boolean(territory?.isClaimed);
  const isMine = Boolean(mine && territory?.ownerAddress === mine);
  const price = territory ? getPriceToTake(territory) : null;
  // What the captain being displaced walks away with at the current floor.
  // Shown next to the price because it is the other half of the same
  // transaction, and because it is the answer to "where does my money go".
  const split =
    territory && claimed && price !== null
      ? calculateProfitSplit(territory.currentPrice, price)
      : null;

  return (
    <div className="ab-inspector">
      <header className="ab-insp-head">
        <span className="ab-flag" aria-hidden="true">
          {country?.flag}
        </span>
        <div className="ab-stack">
          <span className="ab-label">{country?.continent ?? iso2}</span>
          <h2>{country?.name ?? iso2}</h2>
        </div>
        <span className={"ab-tag" + (isMine ? " is-mine" : claimed ? " is-held" : " is-open")}>
          {isMine ? "Yours" : claimed ? "Held" : "Open"}
        </span>
      </header>

      <div className="ab-stack">
        <span className="ab-label">{claimed ? "Price to take" : "Opening price"}</span>
        <span className="ab-figure">{price === null ? "—" : formatAmount(price)}</span>
        <span className="ab-caption">SOL</span>
      </div>

      {/* The banner is an advertisement someone paid for, so it is rendered as
          the object it is rather than as three more rows of metadata. */}
      {claimed && territory?.hasCustomBanner && (
        <figure className="ab-banner">
          <p className="ab-banner-title">{territory.title}</p>
          {territory.tagline && <p className="ab-banner-tagline">{territory.tagline}</p>}
          {territory.link && <p className="ab-banner-link">{territory.link}</p>}
        </figure>
      )}

      <dl className="ab-facts">
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
                <span className="ab-mono">{shortenAddress(territory.ownerAddress)}</span>
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
        <div>
          <dt className="ab-label">They receive</dt>
          <dd className="ab-value">
            {split ? formatPrice(split.previousOwnerPayout) : "—"}
          </dd>
        </div>
      </dl>

      <div className="ab-stub ab-stub-inline">
        <span className="ab-stub-step">Step 4 · the purchase</span>
        <p>
          The bid field, the quick raises, and the six states a purchase moves through
          land here — at the end of the pointer&rsquo;s path, which is where the
          phone&rsquo;s bottom third translates to on a wide screen.
        </p>
      </div>
    </div>
  );
}
