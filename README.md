# corsairs.lol — landing page

Next.js (App Router) static site for **corsairs.lol**, the live territory game
for Solana Seeker. Every route is prerendered — there is no data source at
request time — so the whole thing deploys as static files.

| Route | What it is |
| :--- | :--- |
| `/` | The landing page. |
| `/t/<ISO2>` | 195 country pages. The app deep-links shares here (`src/utils/share.ts`), so all 195 have to resolve. |
| `/sitemap.xml`, `/robots.txt` | Generated from the country list. |

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 200 static pages into out/
```

## Deploy to Vercel

```bash
npx vercel            # preview
npx vercel --prod     # production
```

Framework preset **Next.js** — auto-detected. Then add `corsairs.lol` under
**Project → Settings → Domains**. `vercel.json` carries the cache and security
headers; routing is the framework's.

**There is nothing to configure.** This project reads no environment variable —
no `process.env`, no `.env` file, no API key, no analytics id, no build secret.
Every number and every URL is a literal in [`lib/site.ts`](lib/site.ts), and
`output: "export"` means there is no server at request time to hold a secret
anyway. Import the repo and deploy; the only manual step is the domain.

## Before you touch a number

**Everything on this page traces to the app and the settlement server.** The
authoritative copies, in the order that wins when they disagree:

1. `server/supabase/migrations/*.sql` — this is what builds the transaction
2. `server/supabase/functions/_shared/config.ts`
3. `src/constants/gameConfig.ts` — the app's display copy

The mirrors live in one file here, [`lib/site.ts`](lib/site.ts), and the payout
table is computed from them rather than typed out. If they drift from the SQL,
this page advertises a payout the chain does not make.

### The economics, as of the app's `master`

| | |
| :--- | :--- |
| Opening price | **0.05 SOL** (`BASE_TERRITORY_PRICE.SOL`) |
| Price step | **1.20×** the last price (`PRICE_MULTIPLIER_BPS: 12000`) — a **floor**, not a fixed price |
| Split of the increase | **50 / 50** — `PREVIOUS_OWNER_PROFIT_SHARE_BPS: 5000`, authority `split_payout()` in `0005_treasury_share.sql` |
| Displaced captain gets | principal + half the increase = **1.10p**, i.e. **+10%** over what they paid |
| Treasury gets | **0.10p**, i.e. **8.3% of the sale** |
| First capture | no previous owner, so the **whole** opening price goes to the treasury |
| Bid ceiling | **100×** the floor (`MAX_BID_MULTIPLE`) — a fat-finger guard, enforced in SQL |
| Banner limits | title **22**, tagline **120**, link **150** — enforced by the app, deliberately *not* printed on the page |

> The split was **70/30** in an earlier revision and is **50/50** now. Migration
> `0005` spells out the change and its consequence: protocol revenue per flip
> roughly doubles, and the flipper's return falls from +14% to +10%. Any copy
> quoting 70/30, 0.057, 0.0684 or "+14%" is from before that migration.

### Constraints the copy obeys

- **Never** *trustless*, *fully on-chain*, *decentralised*, *audited* or
  *non-custodial*. Ownership is a row in Postgres; the chain is the payment rail
  and the banner ledger. The footer line says so out loud, on purpose: it is the
  page's whole disclosure now that the "Straight answers" section is gone, so do
  not quietly drop it.
- **No push notifications exist.** There is no `notificationService`. A
  displaced captain sees it in Profile next time they open the app. Never imply
  something reaches their phone.
- **Android and Seeker only.** Mobile Wallet Adapter has no iOS implementation.
  That is the reason, and it never appears in the copy. The footer states the
  consequence instead — "A mobile game for Solana Seeker and Android."
- **Nothing links to a download.** There is no dApp Store listing URL and no
  public repo, so every call to action on the site points at
  [`site.x`](lib/site.ts), the one destination that exists. Do not reintroduce a
  store or GitHub link until there is a real one to reintroduce.
- **No token, points, airdrop or snapshot** — and no usage number nobody has
  measured. There is no claimed-country counter here for that reason.
- **The banner card on `/` is labelled as an example.** The repo's
  `screenshots/` are still the untouched Solana Expo template, so there is no
  real app screenshot to use.
- The board opens honestly — `0007_mainnet_board_reset.sql` wipes the seeded
  scenery, leaving 194 unclaimed and Turkey held by the treasury.

## Regenerating from the app repo

Both are checked into `scripts/` and refuse to write a short result:

```bash
npm run sync:countries   # lib/countries.ts        ← src/data/countries.ts
npm run sync:map         # public/assets/world.svg ← src/data/worldMapGeometry.ts
```

Both default to `../yurt.skr`; pass a path as the first argument otherwise.

## Design

One set of semantic tokens, two themes. Nothing below the token block in
[`app/globals.css`](app/globals.css) names a colour directly, so a palette
change is a change in one place.

| Token | Light | Dark |
| :--- | :--- | :--- |
| `--bg` | `#FBFAF7` paper | `#04090F` |
| `--raised` | `#F3F1EA` | `#0B1621` |
| `--fg` / `--fg-2` / `--fg-3` | `#111A21` / `#3D4A53` / `#5C6970` | `#EBE6DC` / `#B9C4CC` / `#7D8D99` |
| `--accent` | `#B04A17` | `#F0894E` |
| `--link` | `#0E6E85` | `#6FD3E8` |

The accent is **the price, and only the price** — one saturated element per
composition. Both accents clear 4.5:1 on their own ground; the light theme is a
nautical chart, not an inverted dark theme.

Display **Fraunces**, data **IBM Plex Mono**, body **IBM Plex Sans**,
self-hosted via `next/font`. The app itself runs a white "Graphite" theme
(`src/constants/theme.ts`) — that contrast with the marketing surface is
deliberate.

### How the theme switch works

- `:root` holds light. `@media (prefers-color-scheme: dark)` scoped to
  `:root:not([data-theme="light"])` holds dark for readers who have not chosen.
  `:root[data-theme="dark"]` lets an explicit choice win in both directions.
- A tiny inline script in [`app/layout.tsx`](app/layout.tsx) reads
  `localStorage.theme` **before the first paint**, so a reader who chose a theme
  never sees the other one flash. `<html>` carries `suppressHydrationWarning`
  because that script sets an attribute the server did not render.
- [`components/ThemeToggle.tsx`](components/ThemeToggle.tsx) only supplies the
  click. Which icon and which label are showing is decided in CSS off
  `data-theme`, so the button is correct in the static HTML — before hydration,
  and with JavaScript off it still reads as the current theme.
- Until the reader chooses, the page keeps following the system, so a scheduled
  OS theme change still moves it.

`public/assets/world.svg` and `world-light.svg` are the same geometry (the app's
own map — Natural Earth 1:110m, public domain, carrying no ownership state) in
two palettes, because an `<img>`-referenced SVG cannot see the page's
`data-theme`. The stylesheet picks between them with the `--map` custom property,
and only the one in use is fetched. `npm run sync:map` writes both.
