/**
 * A banner, whole.
 *
 * Whole is the requirement, not a preference: a banner is an advertisement
 * somebody paid for and keeps paying for, so the card that shows it off on the
 * front page prints all three fields at full length — 22 characters of title,
 * 120 of tagline, 150 of link — and clips none of them. The map's floating
 * label truncates (`.ab-preview-*` in map.css) because it is 190 pixels wide
 * and lives on top of a country; this card has a column to itself and no
 * excuse. If a long tagline makes it taller than the text beside it, the card
 * is right and the layout gives.
 *
 * No directive on this file: the static example renders on the server, the
 * live one from a client island, and neither needs the other's runtime.
 */
export interface BannerCardProps {
  country: string;
  /** The captain's map colour. Falls back to the site's link blue. */
  color?: string;
  /** Short state chip — "Held" on the example, the board position when live. */
  tag: string;
  title: string;
  /** Both optional. An owner is not obliged to fill the whole card in. */
  tagline?: string;
  link?: string;
  /** Already shortened. This card never holds a full 44-character address. */
  captain: string;
  /** Already formatted, currency and all. */
  price: string;
  caption: string;
}

/** The flag on the card's top rail, tinted with the captain's colour. */
function Flag({ color }: { color?: string }) {
  return (
    <span className="bc-flag" aria-hidden="true" style={color ? { color } : undefined}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6.6 3.4v17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.9 4.9 20.4 8.1 16.9 10.2 20.4 12.3 7.9 15.5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function BannerCard(props: BannerCardProps) {
  const { country, color, tag, title, tagline, link, captain, price, caption } = props;

  return (
    <figure className="banner-card">
      <div className="bc-top">
        <Flag color={color} />
        <span className="bc-country">{country}</span>
        <span className="bc-tag">{tag}</span>
      </div>
      <div className="bc-body">
        <p className="bc-title">{title}</p>
        {/* Rendered only when the captain wrote one. An empty paragraph would
            leave a gap that reads as a loading state on a card that has
            finished loading. */}
        {tagline && <p className="bc-tagline">{tagline}</p>}
        {/* Text, not an anchor. The destination is whatever a stranger typed
            into a banner field, and the front page of this site is not the
            place to hand a stranger an outbound link off it. The app's country
            panel makes the same call, for the same reason. */}
        {link && <p className="bc-link">{link}</p>}
      </div>
      <div className="bc-foot">
        <div>
          <span className="bc-lab">Captain</span>
          <span className="bc-val">{captain}</span>
        </div>
        <div>
          <span className="bc-lab">Price to take</span>
          <span className="bc-val price">{price}</span>
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * The card the page shows when it has no board to read.
 *
 * Word for word what the section carried before any of this was live, caption
 * included. That caption is the point: it says out loud that the card is an
 * illustration, which is what makes it safe to print on a page whose whole job
 * is to be believed.
 */
export const EXAMPLE_BANNER: BannerCardProps = {
  country: "Portugal",
  tag: "Held",
  title: "Lisbon Outpost",
  tagline:
    "Coffee, code and a very small navy. Take it if you think you can hold it.",
  link: "lisbon.example",
  captain: "7xKq…4mNb",
  price: "0.0600 SOL",
  caption: "An example banner. Not a live territory.",
};
