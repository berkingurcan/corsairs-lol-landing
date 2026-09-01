"use client";

import { formatPrice, shortenAddress } from "@/lib/board/config";
import { useSnapshot } from "@/lib/board/useSnapshot";

import { BannerCard, EXAMPLE_BANNER } from "./BannerCard";

/**
 * The most expensive banner on the board, on the front page.
 *
 * The section around it argues that a country is a slot and the banner is what
 * fills it. This is that argument stopping being an argument: the card is
 * whoever is currently paying the most to stand on the map, their words, their
 * colour, their link, at the price it would take to remove them.
 *
 * Falls back to the example card — caption and all — before the read lands, if
 * it never lands, and on a board where nothing has been claimed. Those three
 * are one case as far as this page is concerned: there is no live banner worth
 * showing, so it shows the one that admits it is a drawing.
 */
export function BannerCardLive() {
  const snapshot = useSnapshot();
  const top = snapshot?.top;

  if (!top) return <BannerCard {...EXAMPLE_BANNER} />;

  return (
    <BannerCard
      country={top.countryName}
      color={top.color}
      tag="Top of the board"
      title={top.title}
      tagline={top.tagline}
      link={top.link}
      captain={shortenAddress(top.ownerAddress)}
      price={formatPrice(top.price)}
      caption={
        top.flipCount > 0
          ? `A live banner — the most expensive country on the board, taken ${top.flipCount} ${
              top.flipCount === 1 ? "time" : "times"
            }.`
          : "A live banner — the most expensive country on the board."
      }
    />
  );
}
