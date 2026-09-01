"use client";

/**
 * The banner editor — the second half of "buy now, write it later".
 *
 * Only an owner opens this, and what it signs is a memo with no transfers, so
 * the whole edit costs the network fee. That is what lets the purchase itself
 * stay at two clicks.
 *
 * The preview is the point of the screen, and it is deliberately not a
 * styled-up copy of the form. It draws the card AT MAP SCALE, over the fill
 * the country will actually carry, because that is the only question the
 * author is really asking: what will people see on the board? A title that
 * looks fine in a 17px field and truncates at map scale is a title nobody
 * catches until it is on chain.
 *
 * Colour lives here and nowhere else in the interface. Everything else in this
 * client takes its colour from state or from ownership; this is the one place
 * a colour is a CHOICE, because it is the one colour that paints the map.
 */
import { useEffect, useState } from "react";

import { LIMITS } from "@/lib/board/config";
import { OWNER_COLORS, colorForAddress } from "@/lib/board/ownerColor";
import type { Territory } from "@/lib/board/types";
import { useBanner } from "@/lib/board/useBanner";
import { getCountryByIso2 } from "@/lib/countries";

/** A hex colour the map can actually paint. */
const HEX = /^#[0-9a-fA-F]{6}$/;

export function BannerEditor({
  territory,
  onDone,
}: {
  territory: Territory;
  onDone(): void;
}) {
  const country = getCountryByIso2(territory.countryCode);
  const countryName = country?.name ?? territory.countryCode;
  const banner = useBanner();

  const mineColor = colorForAddress(territory.ownerAddress ?? territory.countryCode);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [link, setLink] = useState("");
  const [color, setColor] = useState(mineColor);

  // Seed from what is already up. A country bought two minutes ago has the
  // country's name and an auto-assigned colour, so the form is never blank.
  useEffect(() => {
    // Sliced, not clamped with an ellipsis: this is an editable value, and a
    // title written under an older, longer cap should come back as something
    // its owner can finish editing rather than as "…".
    setTitle((territory.title || countryName).slice(0, LIMITS.title));
    setTagline(territory.tagline ?? "");
    setLink(territory.link ?? "");
    setColor(territory.color || mineColor);
  }, [
    territory.countryCode,
    territory.title,
    territory.tagline,
    territory.link,
    territory.color,
    countryName,
    mineColor,
  ]);

  const busy =
    banner.status === "preparing" ||
    banner.status === "awaiting-signature" ||
    banner.status === "saving";

  const saveLabel =
    banner.status === "preparing"
      ? "Preparing…"
      : banner.status === "awaiting-signature"
        ? "Check your wallet"
        : banner.status === "saving"
          ? "Saving…"
          : "Save banner";

  if (banner.status === "saved") {
    return (
      <div className="ab-editor">
        <div className="ab-stack">
          <span className="ab-label is-good">Banner up</span>
          <p className="ab-buy-note">
            {countryName} is flying your banner. Rewrite it as often as you like — it
            costs the network fee and nothing else.
          </p>
        </div>
        <button type="button" className="ab-btn ab-btn-primary ab-btn-block" onClick={onDone}>
          Back to {countryName}
        </button>
      </div>
    );
  }

  return (
    <div className="ab-editor">
      <button type="button" className="ab-back" onClick={onDone} disabled={busy}>
        ← {countryName}
      </button>

      {/* At map scale, over the fill this country will carry. */}
      <figure className="ab-preview" style={{ background: HEX.test(color) ? color : mineColor }}>
        <figcaption className="ab-preview-cap">On the board</figcaption>
        <div className="ab-preview-card">
          <p className="ab-preview-title">{title.trim() || countryName}</p>
          {tagline.trim() && <p className="ab-preview-tagline">{tagline.trim()}</p>}
        </div>
        {link.trim() && <p className="ab-preview-link">{link.trim()}</p>}
      </figure>

      <Field
        id="banner-title"
        label="Title"
        value={title}
        onChange={setTitle}
        max={LIMITS.title}
        placeholder={countryName}
        disabled={busy}
      />
      <Field
        id="banner-tagline"
        label="Tagline"
        value={tagline}
        onChange={setTagline}
        max={LIMITS.tagline}
        placeholder="One line about what this is"
        multiline
        disabled={busy}
      />
      <Field
        id="banner-link"
        label="Link"
        value={link}
        onChange={setLink}
        max={LIMITS.link}
        placeholder="yourproject.com"
        disabled={busy}
      />

      <div className="ab-field">
        <span className="ab-label">Map colour</span>
        <div className="ab-swatches" role="radiogroup" aria-label="Map colour">
          {OWNER_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={preset === color}
              aria-label={`Colour ${preset}`}
              className={"ab-swatch" + (preset === color ? " is-on" : "")}
              style={{ background: preset }}
              disabled={busy}
              onClick={() => setColor(preset)}
            />
          ))}
        </div>
        <div className="ab-field-row">
          <input
            className={"ab-input ab-input-hex" + (HEX.test(color) ? "" : " is-bad")}
            type="text"
            value={color}
            spellCheck={false}
            disabled={busy}
            aria-label="Custom colour, hex"
            onChange={(e) => setColor(e.target.value)}
          />
          {/* The ramp is what this wallet was auto-assigned at claim time, so
              getting back to it is always one click. */}
          <button
            type="button"
            className="ab-chip"
            disabled={busy || color === mineColor}
            onClick={() => setColor(mineColor)}
          >
            Reset to mine
          </button>
        </div>
        {!HEX.test(color) && (
          <p className="ab-field-note is-bad">A colour is six hex digits, like {mineColor}.</p>
        )}
      </div>

      {banner.status === "failed" && banner.error && (
        <p className="ab-field-note is-bad">{banner.error}</p>
      )}

      <button
        type="button"
        className="ab-btn ab-btn-primary ab-btn-block"
        disabled={busy || !HEX.test(color)}
        onClick={() =>
          void banner.save({
            countryCode: territory.countryCode,
            title: title.trim(),
            tagline: tagline.trim(),
            link: link.trim(),
            color,
          })
        }
      >
        {saveLabel}
      </button>
      <p className="ab-buy-foot">Costs the network fee only — no purchase price.</p>
    </div>
  );
}

/**
 * A field, with its count.
 *
 * The count appears only in the last fifth of the allowance. A counter that is
 * always on turns writing a sentence into filling in a form, and nobody needs
 * to be told they have 108 characters left.
 */
function Field({
  id,
  label,
  value,
  onChange,
  max,
  placeholder,
  multiline,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange(next: string): void;
  max: number;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const near = value.length >= max * 0.8;
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="ab-field">
      <div className="ab-field-head">
        <label className="ab-label" htmlFor={id}>
          {label}
        </label>
        {near && (
          <span className={"ab-count" + (value.length === max ? " is-bad" : "")}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <Tag
        id={id}
        className="ab-input"
        value={value}
        maxLength={max}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? 3 : undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}
