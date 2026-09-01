/**
 * Shell icons.
 *
 * Three of them are the phone's own tab icons — Ionicons `map`, `pulse` and
 * `person` — redrawn as strokes so they take `currentColor` and sit on the
 * same 24-unit grid as `--i-lg`. The phone signals the active tab by swapping
 * to the filled glyph; here that job belongs to colour and the pill behind the
 * label, so there is one glyph per destination rather than two.
 */

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** The board. */
export function MapIcon({ className }: Props) {
  return (
    <svg className={className} {...base}>
      <path d="M9.2 4.3 3.5 6.6v13.1l5.7-2.3 5.6 2.3 5.7-2.3V4.3l-5.7 2.3z" />
      <path d="M9.2 4.3v13.1M14.8 6.6v13.1" />
    </svg>
  );
}

/** Activity. */
export function PulseIcon({ className }: Props) {
  return (
    <svg className={className} {...base}>
      <path d="M2.6 12h4l2.4-6.6 4 13.2 2.4-6.6h6" />
    </svg>
  );
}

/** Holdings — the phone calls this Profile. */
export function PersonIcon({ className }: Props) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

export function WalletIcon({ className }: Props) {
  return (
    <svg className={className} {...base}>
      <rect x="3.2" y="6" width="17.6" height="12" rx="3" />
      <path d="M20.8 10.4h-3.4a1.6 1.6 0 0 0 0 3.2h3.4" />
    </svg>
  );
}
