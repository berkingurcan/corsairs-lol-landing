"use client";

/**
 * Holdings — the wallet, and what it owns.
 *
 * Disconnected, this is deliberately not an empty state with a connect button
 * in the middle of it. It shows the board's aggregate with the wallet section
 * inert above: someone who has not connected a wallet is exactly the reader
 * who needs a reason to, and "sign in to see nothing" is not one. There is
 * something to look at before there is a wallet.
 *
 * Connected, the balance is the FIGURE and the address is the caption under
 * it. Nobody opens this screen to read their own public key.
 */
import Link from "next/link";
import { useMemo } from "react";

import { useBoard } from "@/lib/board/BoardProvider";
import {
  formatAmount,
  formatPrice,
  getExplorerUrl,
  shortenAddress,
  timeAgo,
} from "@/lib/board/config";
import { boardStats, holdingsFor } from "@/lib/board/derive";
import { getPriceToTake } from "@/lib/board/config";
import { getCountryByIso2 } from "@/lib/countries";
import { colorForAddress } from "@/lib/board/ownerColor";
import { useWallet } from "@/lib/wallet/WalletProvider";

export function HoldingsBoard() {
  const { territories, flips, loading } = useBoard();
  const wallet = useWallet();

  const stats = useMemo(() => boardStats(territories, flips), [territories, flips]);
  const holdings = useMemo(
    () => holdingsFor(territories, flips, wallet.publicKey),
    [territories, flips, wallet.publicKey],
  );

  if (loading) return <p className="ab-caption">Reading the board…</p>;

  return (
    <div className="ab-grid-lg">
      {/* ── The wallet ── */}
      {wallet.connected ? (
        <section className="ab-panel">
          <div className="ab-stack">
            <span className="ab-label">Balance</span>
            <span className="ab-figure">
              {wallet.balance === null ? "—" : formatAmount(wallet.balance)}
            </span>
            <span className="ab-caption">
              SOL ·{" "}
              <a
                href={getExplorerUrl(`address/${wallet.publicKey}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="ab-mono"
              >
                {shortenAddress(wallet.publicKey!, 6, 6)}
              </a>
            </span>
          </div>

          <dl className="ab-facts ab-facts-tight" style={{ marginTop: "var(--s-xl)" }}>
            <div>
              <dt className="ab-label">Countries held</dt>
              <dd className="ab-value">{holdings.held.length}</dd>
            </div>
            <div>
              <dt className="ab-label">On the board</dt>
              <dd className="ab-value">{formatAmount(holdings.portfolioValue)}</dd>
            </div>
            <div>
              {/* What a rival is looking at, which is the number that decides
                  whether anyone comes for you. */}
              <dt className="ab-label">Costs rivals to take</dt>
              <dd className="ab-value">{formatAmount(holdings.defenceValue)}</dd>
            </div>
            <div>
              <dt className="ab-label">Realised profit</dt>
              <dd className={"ab-value" + (holdings.realisedProfit > 0 ? " is-good" : "")}>
                {formatAmount(holdings.realisedProfit)}
              </dd>
            </div>
          </dl>
          <p className="ab-buy-foot">
            Profit and spend are counted over the recent takeovers the board carries, not
            over all time.
          </p>
        </section>
      ) : (
        <section className="ab-panel">
          <div className="ab-stack">
            <span className="ab-label">No wallet</span>
            <h2>Nothing is held here yet.</h2>
          </div>
          <p className="ab-caption" style={{ marginTop: "var(--s-md)" }}>
            Connect one and this becomes your balance, your countries and what each would
            cost to take from you. Until then, the board itself is below.
          </p>
          <button
            type="button"
            className="ab-btn ab-btn-primary"
            style={{ marginTop: "var(--s-lg)" }}
            onClick={() => void wallet.connect()}
            disabled={wallet.connecting}
          >
            {wallet.connecting ? "Connecting…" : "Connect wallet"}
          </button>
        </section>
      )}

      {/* ── Yours ── */}
      {wallet.connected && (
        <section>
          <h2 className="ab-section-head">Your countries</h2>
          {holdings.held.length === 0 ? (
            <p className="ab-caption">
              None yet. Every country is for sale, and an unclaimed one opens at{" "}
              {formatPrice(0.05)}.
            </p>
          ) : (
            <ol className="ab-rows">
              {holdings.held.map((territory) => {
                const country = getCountryByIso2(territory.countryCode);
                return (
                  <li key={territory.countryCode}>
                    <Link className="ab-row" href={`/app/c/${territory.countryCode}`}>
                      <span className="ab-row-flag" aria-hidden="true">
                        {country?.flag}
                      </span>
                      <span className="ab-row-main">
                        <span className="ab-row-title">{country?.name}</span>
                        <span className="ab-row-meta">
                          <span
                            className="ab-owner-dot"
                            style={{ background: territory.color }}
                            aria-hidden="true"
                          />
                          {territory.title || "No banner yet"}
                        </span>
                      </span>
                      <span className="ab-row-figures">
                        <span className="ab-value">{formatAmount(getPriceToTake(territory))}</span>
                        <span className="ab-row-sub">to take from you</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      {/* ── Taken from you ──
          Each alert carries the banner that was up, so taking the country back
          restores it in one action rather than in a form. */}
      {wallet.connected && holdings.alerts.length > 0 && (
        <section>
          <h2 className="ab-section-head">Taken from you</h2>
          <ol className="ab-rows">
            {holdings.alerts.map((alert) => (
              <li key={alert.txSignature}>
                <Link className="ab-row" href={`/app/c/${alert.countryCode}`}>
                  <span className="ab-row-flag" aria-hidden="true">
                    {alert.countryFlag}
                  </span>
                  <span className="ab-row-main">
                    <span className="ab-row-title">{alert.countryName}</span>
                    <span className="ab-row-meta">
                      <span
                        className="ab-owner-dot"
                        style={{ background: colorForAddress(alert.newOwnerAddress) }}
                        aria-hidden="true"
                      />
                      {shortenAddress(alert.newOwnerAddress)} paid{" "}
                      {formatAmount(alert.newPrice)}
                      <span className="ab-row-when">· {timeAgo(alert.timestamp)}</span>
                    </span>
                  </span>
                  <span className="ab-row-figures">
                    <span className="ab-value is-good">+{formatAmount(alert.yourProfit)}</span>
                    <span className="ab-row-sub">{formatAmount(alert.yourPayout)} paid out</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── The board itself ── */}
      <section>
        <h2 className="ab-section-head">The board</h2>
        <dl className="ab-facts">
          <div>
            <dt className="ab-label">Countries claimed</dt>
            <dd className="ab-value">
              {stats.claimed} <span className="ab-muted">of {stats.total}</span>
            </dd>
          </div>
          <div>
            <dt className="ab-label">Captains</dt>
            <dd className="ab-value">{stats.captains}</dd>
          </div>
          <div>
            <dt className="ab-label">On the board</dt>
            <dd className="ab-value">{formatAmount(stats.onTheBoard)}</dd>
          </div>
          <div>
            <dt className="ab-label">Most contested</dt>
            <dd className="ab-value">
              {stats.mostContested ? (
                <>
                  {getCountryByIso2(stats.mostContested.countryCode)?.name}{" "}
                  <span className="ab-muted">
                    · {stats.mostContested.flipCount} hands
                  </span>
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
