/**
 * Regenerate public/assets/world.svg from the app repo's map geometry.
 *
 *   node scripts/sync-map.mjs [path-to-app-repo]
 *
 * Pure geography — no ownership state is baked in, deliberately: this file is
 * on a CDN and the board moves every few seconds.
 */
import fs from "node:fs";
import path from "node:path";

const appRepo = process.argv[2] ?? "../yurt.skr";
const src = fs.readFileSync(
  path.join(appRepo, "src/data/worldMapGeometry.ts"),
  "utf8",
);

const body = src.slice(src.indexOf("export const COUNTRY_PATHS"));
const re = /^\s{2}([A-Z]{2}):\s*"([^"]+)",$/gm;

const paths = [];
for (const m of body.matchAll(re)) {
  paths.push(`<path id="c-${m[1]}" d="${m[2]}"/>`);
}

if (paths.length < 100) {
  console.error(`Parsed ${paths.length} paths, expected ~167. Refusing to write.`);
  process.exit(1);
}

// One geometry, two palettes. The stylesheet picks between them with a custom
// property, because an <img>-referenced SVG cannot see the page's data-theme.
const THEMES = [
  { file: "world.svg", fill: "#0D1E2B", stroke: "#1D3F47" },
  { file: "world-light.svg", fill: "#DAD4C3", stroke: "#BAB29B" },
];

for (const theme of THEMES) {
  fs.writeFileSync(
    `public/assets/${theme.file}`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 800" width="2000" height="800" role="img" aria-label="World map, 195 countries">
<title>World map</title>
<g fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="0.9" stroke-linejoin="round">
${paths.join("\n")}
</g>
</svg>`,
  );
  console.log(`public/assets/${theme.file} — ${paths.length} country paths`);
}
