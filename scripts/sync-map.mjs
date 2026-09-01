/**
 * Regenerate the map from the app repo's geometry.
 *
 *   node scripts/sync-map.mjs [path-to-app-repo]
 *
 * Two outputs, one source:
 *
 *   public/assets/world.svg, world-light.svg   flat backdrops for the hero
 *   lib/map/geometry.ts                        the interactive board's data
 *
 * They come from the same parse on purpose. A marketing page and a product
 * showing two different world maps is the kind of drift nobody notices until
 * somebody screenshots both.
 *
 * Pure geography — no ownership state is baked into either, deliberately: the
 * SVGs sit on a CDN and the board moves every few seconds.
 */
import fs from "node:fs";
import path from "node:path";

const appRepo = process.argv[2] ?? "../yurt.skr";
const sourcePath = path.join(appRepo, "src/data/worldMapGeometry.ts");
const src = fs.readFileSync(sourcePath, "utf8");

/**
 * Lifts a declaration out of the source by its opening line and its
 * terminator, so the copies below are the app's text rather than a
 * re-derivation of it. Anything this cannot find is a fatal error: silently
 * emitting a file with a missing export is worse than not emitting one.
 */
function block(start, end) {
  const from = src.indexOf(start);
  if (from === -1) throw new Error(`sync-map: "${start}" not found in ${sourcePath}`);
  const to = src.indexOf(end, from + start.length);
  if (to === -1) throw new Error(`sync-map: no terminator for "${start}"`);
  return src.slice(from, to + end.length);
}

const VIEWBOX = block("export const MAP_VIEWBOX", ";");
const BOUNDS = block("export const MAP_BOUNDS", "} as const;");
const PROJECT = block("export function projectToMap", "\n}");
const PATHS = block("export const COUNTRY_PATHS", "\n};");
const BBOX = block("export const COUNTRY_BBOX", "\n};");
const NEUTRAL = block("export const NEUTRAL_LAND_PATH", ";");
const MARKER_ONLY = block("export const MARKER_ONLY_COUNTRIES", ";");

// ──── The flat SVGs ────

const paths = [];
for (const m of PATHS.matchAll(/^\s{2}([A-Z]{2}):\s*"([^"]+)",$/gm)) {
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

// ──── The board's geometry ────

fs.mkdirSync("lib/map", { recursive: true });
fs.writeFileSync(
  "lib/map/geometry.ts",
  `/**
 * World map geometry (generated — do not hand-edit).
 *
 * Copied from \`src/data/worldMapGeometry.ts\` in the app repo by
 * \`scripts/sync-map.mjs\`. Equirectangular projection of Natural Earth 1:110m
 * admin-0 borders, clipped to lat 84°N..-60°S and simplified for a phone.
 * Source: https://github.com/nvkelso/natural-earth-vector (public domain).
 *
 * ⚠ This file is ~120 KB. It must only ever be reached through a dynamic
 * import inside the /app segment. If it lands in a shared chunk it ships with
 * the marketing pages, where nothing reads it — \`components/app/board\` is the
 * only place that may import it, and only lazily.
 */

${VIEWBOX}

${BOUNDS}

/** Projects a lon/lat pair into map viewBox coordinates. */
${PROJECT}

${PATHS}

${BBOX}

/** Non-sovereign landmasses (Greenland, W. Sahara, …) drawn as inert terrain. */
${NEUTRAL}

/** Countries with no 110m polygon (small island states) — drawn as beacons. */
${MARKER_ONLY}
`,
);

const bboxCount = [...BBOX.matchAll(/^\s{2}[A-Z]{2}:/gm)].length;
const markerCount = (MARKER_ONLY.match(/"[A-Z]{2}"/g) ?? []).length;
console.log(
  `lib/map/geometry.ts — ${paths.length} paths, ${bboxCount} bboxes, ${markerCount} beacons`,
);
