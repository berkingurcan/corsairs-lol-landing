# corsairs.lol — landing page

A static, zero-dependency landing page for **corsairs.lol**, the live territory
game for Solana Seeker. One HTML file, one stylesheet, four assets. No build
step, no framework, nothing to keep up to date.

## Run it locally

```bash
python3 -m http.server 8899
# → http://127.0.0.1:8899
```

## Deploy to Vercel

There is no build. Vercel serves the directory as-is.

```bash
npx vercel            # preview
npx vercel --prod     # production
```

Framework preset: **Other**. Build command: none. Output directory: `.`

Then add `corsairs.lol` (and `www.corsairs.lol` redirecting to the apex) under
**Project → Settings → Domains**. `vercel.json` handles clean URLs, immutable
caching on `/assets/*`, and the usual security headers.

## Files

| Path | What it is |
| :--- | :--- |
| `index.html` | The whole page. |
| `styles.css` | The whole design. Palette and type tokens live at the top. |
| `assets/world.svg` | Equirectangular world map, 167 country paths, generated from `src/data/worldMapGeometry.ts` in the app repo (Natural Earth 1:110m, public domain). Pure geography — it carries **no** ownership state. |
| `assets/og.png` | 1200×630 social card, composed from the brand cover in `design/out/`. |
| `assets/favicon.svg`, `assets/icon-512.png`, `assets/mark.svg` | The swallowtail-flag mark. |

## Where the design comes from

Nothing here was invented. It follows `design/BRAND.md` in the app repo:

- **Ground** `#04090F` · surface `#0D1E2B` · shoal `#1D3F47`
- **Accent** `#F0894E` — the price, and only the price. One saturated element
  per composition.
- Rim `#6FD3E8` for links and focus. Text `#EBE6DC` / `#B9C4CC` / `#7D8D99`.
- Display **Fraunces**, data **IBM Plex Mono**, body **IBM Plex Sans**.

The app itself runs the white Graphite palette. That is deliberate, not an
inconsistency: the app keeps its nerve, the marketing carries the weather.

## Before you edit the copy

Every product claim on this page traces to `cmo/00-product.md`,
`cmo/02-positioning.md` and `cmo/06-voice.md` in the app repo. The constraints
that shaped this page, so an edit does not quietly break one:

- The settlement path is **designed** to pay the displaced captain. It has not
  been proven by a real mainnet takeover. Keep the design tense and keep the
  caveat next to the table until a signature exists to link.
- Never write *trustless*, *fully on-chain*, *decentralised*, *audited* or
  *non-custodial*. Ownership is a row in a Postgres database; the chain is the
  payment rail and the banner ledger. The page says so out loud, on purpose.
- Never claim a push notification reaches a displaced captain. It does not.
- Android and Seeker only. Never show or imply an iPhone.
- No token, points, airdrop or snapshot — and no number we have not measured.
  There is no claimed-country counter here because the seeded board is not real
  data.
- No competitor is named, anywhere.
- The banner card is labelled as an example. Do not replace it with a
  screenshot of the live map while the seed migration still ships.

## Update the map

If the app's map geometry changes, regenerate the SVG from the app repo:

```bash
node -e '
const fs = require("fs");
const src = fs.readFileSync("../yurt.skr/src/data/worldMapGeometry.ts", "utf8");
const body = src.slice(src.indexOf("export const COUNTRY_PATHS"));
const re = /^\s{2}([A-Z]{2}):\s*"([^"]+)",$/gm;
let m, out = [];
while ((m = re.exec(body))) out.push(`<path id="c-${m[1]}" d="${m[2]}"/>`);
fs.writeFileSync("assets/world.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 800" width="2000" height="800" role="img" aria-label="World map, 195 countries">
<title>World map</title>
<g fill="#0D1E2B" stroke="#1D3F47" stroke-width="0.9" stroke-linejoin="round">
${out.join("\n")}
</g>
</svg>`);
'
```
