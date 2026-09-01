"use client";

/**
 * The purchase.
 *
 * Click a country, click the button. No title, no tagline, no link, no colour
 * picker: none of that is part of settlement, so none of it belongs between
 * the player and the wallet. The banner is written afterwards, by a separate
 * transfer-free transaction — see BannerEditor.
 *
 * ── Bidding ──
 *
 * The price is a FLOOR, not a fixed amount. Anyone may pay more, and the extra
 * is not a tip: it goes to the captain being displaced, and it becomes the
 * country's new price, so the next buyer has to beat what THIS sale paid. That
 * is the point of raising, and it is why the field defaults to the minimum
 * rather than to nothing — an empty field reads as optional.
 *
 * The client still does not decide what anything costs. It sends an amount
 * somebody typed and the server accepts, refuses or ignores it; whatever comes
 * back in the quote is what the wallet is asked to sign. When nobody has
 * raised, the bid is omitted entirely, so a board that moved comes back as
 * "the price went up, pay it?" rather than as an error about a stale number.
 *
 * ── The six states ──
 *
 * The phone runs this off one `isSubmitting` boolean and a stack of modal
 * alerts, which works where a sheet can only be in one place at a time. A
 * panel that stays mounted has to render the middle of the flow, so the middle
 * of the flow is drawn here explicitly. `usePurchase` owns the machine; this
 * file is only what each of its states looks like.
 */
import { useEffect, useMemo, useState } from "react";

import {
  QUICK_RAISES,
  calculateProfitSplit,
  formatAmount,
  formatAmountForInput,
  formatPrice,
  fromLamports,
  getExplorerUrl,
  getMaxBid,
  getPriceToTake,
  parseAmountInput,
  parseAmountToLamports,
  shortenAddress,
  toLamports,
} from "@/lib/board/config";
import type { usePurchase } from "@/lib/board/usePurchase";
import type { Territory } from "@/lib/board/types";
import { getCountryByIso2 } from "@/lib/countries";
import { useWallet } from "@/lib/wallet/WalletProvider";

type Purchase = ReturnType<typeof usePurchase>;

/** Statuses where the form is not the player's to touch. */
const LOCKED: Purchase["status"][] = [
  "quoting",
  "confirming-price",
  "awaiting-signature",
  "settling",
];

export function PurchasePanel({
  territory,
  purchase,
  onEditBanner,
}: {
  territory: Territory;
  purchase: Purchase;
  onEditBanner(): void;
}) {
  const wallet = useWallet();

  /**
   * Whether the machine's current state belongs to THIS country.
   *
   * The hook is one instance for the whole board, so a purchase that failed on
   * Portugal left "Not bought" sitting in the panel for the next country
   * clicked. Selection is pinned while a purchase is in flight, so the only
   * states that can outlive their country are the terminal two — which is
   * exactly the case this guard covers. Reading it rather than resetting means
   * a finished purchase is still there if you come back to it.
   */
  const active = purchase.countryCode === territory.countryCode;
  const country = getCountryByIso2(territory.countryCode);
  const countryName = country?.name ?? territory.countryCode;
  const isMine = Boolean(wallet.publicKey && territory.ownerAddress === wallet.publicKey);

  // ──── The floor ────
  // What the country costs to take right now, and the least a bid may be. An
  // ESTIMATE: the figure the server charges comes back from the quote,
  // computed from a locked row. The two agree unless the board moved since the
  // last sync — which is exactly when they should not.
  const minPrice = useMemo(() => getPriceToTake(territory), [territory]);
  const maxBid = useMemo(() => getMaxBid(minPrice), [minPrice]);

  // Compared in integer lamports, never in SOL. Two amounts that render
  // identically can differ in the twelfth decimal place, and a field that
  // rejects the number it is showing you is worse than no validation at all.
  const minLamports = useMemo(() => toLamports(minPrice), [minPrice]);
  const maxLamports = useMemo(() => toLamports(maxBid), [maxBid]);

  // ──── The bid ────
  // Held as TEXT. A numeric state would have to decide what "" and "0." mean
  // while someone is still typing, and both available answers are wrong: it
  // either swallows the keystroke or reports an error about a field they have
  // not finished filling in.
  const [bidText, setBidText] = useState(() => formatAmountForInput(minPrice));
  const [bidTouched, setBidTouched] = useState(false);

  // The board moves under an open panel every ten seconds. Track the new floor
  // while the field is untouched; once a number has been typed it is theirs,
  // and the line under the field reports the mismatch instead of the panel
  // quietly rewriting what they chose to pay.
  useEffect(() => {
    if (!bidTouched) setBidText(formatAmountForInput(minPrice));
  }, [minPrice, bidTouched]);

  // A new country is a new bid.
  useEffect(() => {
    setBidTouched(false);
  }, [territory.countryCode]);

  const bid = parseAmountInput(bidText);
  const bidLamports = parseAmountToLamports(bidText);
  const isRaise = bidLamports !== null && bidLamports > minLamports;

  /** What the player has agreed to pay. Falls back to the floor while typing. */
  const payable = bid ?? minPrice;

  const bidError = useMemo(() => {
    if (bidLamports === null) return "Enter an amount.";
    if (bidLamports < minLamports) return `The minimum is ${formatPrice(minPrice)}.`;
    if (bidLamports > maxLamports) return `The most you can bid here is ${formatPrice(maxBid)}.`;
    return null;
  }, [bidLamports, minLamports, maxLamports, minPrice, maxBid]);

  // A null balance means "not loaded", not "zero" — defer to the wallet's own
  // preflight rather than blocking a button on missing data.
  const canAfford = wallet.balance === null || wallet.balance >= payable;

  /** The one line under the field: what is wrong, or why raising is worth it. */
  const bidNote = useMemo(() => {
    if (bidError) return { text: bidError, bad: true };
    if (wallet.balance !== null && !canAfford) {
      return {
        text: `${formatPrice(payable - wallet.balance)} short — you have ${formatPrice(wallet.balance)}`,
        bad: true,
      };
    }
    if (isRaise) {
      return {
        text: `${formatPrice(payable - minPrice)} above the ${territory.isClaimed ? "asking" : "opening"} price, and the next buyer must beat ${formatPrice(payable)}.`,
        bad: false,
      };
    }
    return { text: "Bid higher to outpay anyone else circling this one.", bad: false };
  }, [bidError, wallet.balance, canAfford, isRaise, payable, minPrice, territory.isClaimed]);

  /** Preset raises, so the common case is a click and not a typed decimal. */
  const quickRaises = useMemo(
    () =>
      QUICK_RAISES.map((fraction) => {
        const lamports = Math.round(minLamports * (1 + fraction));
        return {
          fraction,
          label: `+${Math.round(fraction * 100)}%`,
          text: formatAmountForInput(fromLamports(lamports)),
        };
      }),
    [minLamports],
  );

  // Where the money goes, computed from what is actually being paid rather
  // than from the asking price — a raise changes the split, and showing the
  // captain's cut as if nobody had raised would understate exactly the thing
  // that makes raising worth doing.
  const split = useMemo(
    () =>
      territory.isClaimed
        ? calculateProfitSplit(territory.currentPrice, payable)
        : { previousOwnerPayout: 0, vaultPayout: payable, delta: payable, previousOwnerProfit: 0 },
    [territory.isClaimed, territory.currentPrice, payable],
  );

  // ──── A country you already hold ────
  // Not a purchase. Taking your own country from yourself is not a thing the
  // board does, so the action here is the one that IS available to an owner.
  if (isMine) {
    return (
      <div className="ab-buy">
        <p className="ab-buy-note">
          You hold {countryName}. The next captain pays at least{" "}
          <b>{formatPrice(minPrice)}</b> to take it, and{" "}
          <b>{formatPrice(split.previousOwnerPayout)}</b> of that comes to you.
        </p>
        <div className="ab-buy-action">
          <button type="button" className="ab-btn ab-btn-primary ab-btn-block" onClick={onEditBanner}>
            {territory.hasCustomBanner ? "Edit your banner" : "Raise a banner"}
          </button>
          <p className="ab-buy-foot">Costs the network fee only — no purchase price.</p>
        </div>
      </div>
    );
  }

  // ──── Terminal: the purchase finished ────
  if (active && purchase.status === "settled") {
    const settled = purchase.outcome === "settled";
    return (
      <div className="ab-buy">
        <div className="ab-stack">
          <span className={settled ? "ab-label is-good" : "ab-label is-warn"}>
            {settled ? "Settled" : purchase.outcome === "pending" ? "Paid · confirming" : "Beaten to it"}
          </span>
          <p className="ab-buy-note">
            {purchase.message ?? `${countryName} is yours.`}
          </p>
        </div>

        {purchase.signature && (
          <a
            className="ab-receipt"
            href={getExplorerUrl(`tx/${purchase.signature}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ab-label">Signature</span>
            <span className="ab-mono">{shortenAddress(purchase.signature, 8, 8)}</span>
          </a>
        )}

        {/* The banner prompt lives here, at the moment ownership is real,
            rather than as a form standing between the player and the wallet. */}
        <div className="ab-buy-action">
          {settled && (
            <button
              type="button"
              className="ab-btn ab-btn-primary ab-btn-block"
              onClick={() => {
                purchase.reset();
                onEditBanner();
              }}
            >
              Raise a banner
            </button>
          )}
          <button type="button" className="ab-btn ab-btn-ghost ab-btn-block" onClick={purchase.reset}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (active && purchase.status === "failed") {
    return (
      <div className="ab-buy">
        <div className="ab-stack">
          <span className="ab-label is-bad">Not bought</span>
          <p className="ab-buy-note">{purchase.failure?.message}</p>
        </div>
        <div className="ab-buy-action">
          <button type="button" className="ab-btn ab-btn-primary ab-btn-block" onClick={purchase.reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ──── The board moved ────
  // Charging the difference silently is a bait and switch, so the flow stops
  // and asks. It is a distinct state rather than a modal because the panel is
  // already the place this conversation is happening.
  if (active && purchase.status === "confirming-price" && purchase.priceChange) {
    const { agreed, quoted } = purchase.priceChange;
    return (
      <div className="ab-buy">
        <div className="ab-stack">
          <span className="ab-label is-warn">The board moved</span>
          <p className="ab-buy-note">
            {countryName} was <s>{formatPrice(agreed)}</s> when you clicked. The server
            prices it at <b>{formatPrice(quoted)}</b> now.
          </p>
        </div>
        <div className="ab-buy-action">
          <button
            type="button"
            className="ab-btn ab-btn-primary ab-btn-block"
            onClick={purchase.confirmPrice}
          >
            Pay {formatPrice(quoted)}
          </button>
          <button
            type="button"
            className="ab-btn ab-btn-ghost ab-btn-block"
            onClick={purchase.declinePrice}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ──── Idle, and the three waits ────
  const locked = active && LOCKED.includes(purchase.status);
  const label = (() => {
    if (!wallet.connected) return `Connect wallet`;
    switch (active ? purchase.status : "idle") {
      case "quoting":
        return "Pricing…";
      case "awaiting-signature":
        return "Check your wallet";
      case "settling":
        return "Settling…";
      default:
        return `${territory.isClaimed ? "Take" : "Claim"} ${countryName}`;
    }
  })();

  return (
    <div className="ab-buy">
      <div className="ab-field">
        <label className="ab-label" htmlFor="bid">
          Your bid
        </label>
        <div className="ab-field-row">
          <input
            id="bid"
            className={"ab-input" + (bidNote.bad ? " is-bad" : "")}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={bidText}
            disabled={locked}
            onChange={(e) => {
              setBidTouched(true);
              setBidText(e.target.value);
            }}
          />
          <span className="ab-field-unit">SOL</span>
        </div>

        <div className="ab-raises">
          {quickRaises.map((raise) => (
            <button
              key={raise.fraction}
              type="button"
              className={"ab-chip" + (bidText === raise.text ? " is-on" : "")}
              disabled={locked}
              onClick={() => {
                setBidTouched(true);
                setBidText(raise.text);
              }}
            >
              {raise.label}
            </button>
          ))}
        </div>

        <p className={"ab-field-note" + (bidNote.bad ? " is-bad" : "")}>{bidNote.text}</p>
      </div>

      {/* Where the money goes at the amount actually being paid. */}
      <dl className="ab-facts ab-facts-tight">
        <div>
          <dt className="ab-label">{territory.isClaimed ? "To the captain" : "To the treasury"}</dt>
          <dd className="ab-value">
            {formatAmount(territory.isClaimed ? split.previousOwnerPayout : split.vaultPayout)}
          </dd>
        </div>
        {territory.isClaimed && (
          <div>
            <dt className="ab-label">To the treasury</dt>
            <dd className="ab-value">{formatAmount(split.vaultPayout)}</dd>
          </div>
        )}
      </dl>

      {/* The exact amount, restated, at the moment the wallet is open. It is
          the last thing anyone reads before they approve a payment. */}
      {active && purchase.status === "awaiting-signature" && purchase.signingLabel && (
        <p className="ab-buy-note is-signing">
          Approve <b>{purchase.signingLabel}</b> in your wallet. Nothing is charged until
          you do.
        </p>
      )}

      <div className="ab-buy-action">
        <button
          type="button"
          className="ab-btn ab-btn-primary ab-btn-block"
          disabled={locked || (wallet.connected && (Boolean(bidError) || !canAfford))}
          onClick={() => {
            if (!wallet.connected) return void wallet.connect();
            purchase.buy({
              countryCode: territory.countryCode,
              payable,
              // Sent ONLY when they actually raised. See the note at the top.
              ...(isRaise && bidLamports !== null ? { bidLamports } : {}),
            });
          }}
        >
          {label}
        </button>

        <p className="ab-buy-foot">
          The price is a floor. Raise it and the extra goes to the captain you displace.
        </p>
      </div>
    </div>
  );
}
