"use client";

/**
 * Activity — the board ordered by what it cost.
 *
 * See `activityRows` for why this is a price list and not a feed. The short
 * version: every row is an advertisement somebody paid for, and the ordering
 * has to be one they can move themselves up in.
 *
 * Desktop gains a second column the phone has no room for. On the phone the
 * leaderboard is a separate segment you switch to; here it sits beside the
 * rows, because "who holds the most" is context for the list rather than a
 * different question.
 */
import Link from "next/link";
import { useMemo } from "react";

import { useBoard } from "@/lib/board/BoardProvider";
import { formatAmount, formatPrice, shortenAddress, timeAgo } from "@/lib/board/config";
import { activityRows, leaderboard } from "@/lib/board/derive";
import { getCountryByIso2 } from "@/lib/countries";
import { useWallet } from "@/lib/wallet/WalletProvider";

export function ActivityBoard() {
  const { territories, flips, loading } = useBoard();
  const { publicKey } = useWallet();

  const rows = useMemo(() => activityRows(territories, flips), [territories, flips]);
  const leaders = useMemo(() => leaderboard(territories), [territories]);

  if (loading) return <p className="ab-caption">Reading the board…</p>;

  if (rows.length === 0) {
    return (
      <p className="ab-caption">
        Nobody has claimed a country yet. The whole map is open at{" "}
        {formatPrice(0.05)}.
      </p>
    );
  }

  return (
    <div className="ab-split">
      <ol className="ab-rows">
        {rows.map((row, index) => {
          const country = getCountryByIso2(row.territory.countryCode);
          const mine = publicKey && row.territory.ownerAddress === publicKey;
          return (
            <li key={row.territory.countryCode}>
              <Link className="ab-row" href={`/app/c/${row.territory.countryCode}`}>
                <span className="ab-row-rank">{index + 1}</span>
                <span className="ab-row-flag" aria-hidden="true">
                  {country?.flag}
                </span>

                <span className="ab-row-main">
                  <span className="ab-row-title">
                    {country?.name ?? row.territory.countryCode}
                    {mine && <span className="ab-row-mine">Yours</span>}
                  </span>
                  {/* The banner if there is one, and the takeover that put this
                      captain here if there is not — the row has to read as
                      activity either way. */}
                  <span className="ab-row-meta">
                    {row.territory.hasCustomBanner && row.territory.title ? (
                      <>
                        <span
                          className="ab-owner-dot"
                          style={{ background: row.territory.color }}
                          aria-hidden="true"
                        />
                        {row.territory.title}
                      </>
                    ) : (
                      <>
                        <span
                          className="ab-owner-dot"
                          style={{ background: row.territory.color }}
                          aria-hidden="true"
                        />
                        {row.territory.ownerAddress
                          ? shortenAddress(row.territory.ownerAddress)
                          : "—"}
                      </>
                    )}
                    {row.flip && (
                      <span className="ab-row-when">
                        · {row.flip.previousOwner ? "taken" : "claimed"}{" "}
                        {timeAgo(row.flip.timestamp)}
                      </span>
                    )}
                  </span>
                </span>

                <span className="ab-row-figures">
                  <span className="ab-value">{formatAmount(row.price)}</span>
                  <span className="ab-row-sub">
                    {row.territory.flipCount === 1
                      ? "first claim"
                      : `${row.territory.flipCount} hands`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <aside className="ab-aside" aria-label="Most countries held">
        <h2>Most held</h2>
        <ol className="ab-leaders">
          {leaders.map((leader, index) => (
            <li key={leader.address}>
              <span className="ab-row-rank">{index + 1}</span>
              <span className="ab-mono">{shortenAddress(leader.address)}</span>
              <span className="ab-value">{leader.countries}</span>
            </li>
          ))}
        </ol>
        <p className="ab-caption">
          By countries held, not by what they are worth — the count is what the map
          shows, and a table that disagrees with the map is one nobody believes.
        </p>
      </aside>
    </div>
  );
}
