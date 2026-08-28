/**
 * Regenerate lib/countries.ts from the app repo.
 *
 * The /t/<ISO2> routes exist so the app's share links resolve, so the two
 * lists have to agree. Run this when the app's country list changes.
 *
 *   node scripts/sync-countries.mjs [path-to-app-repo]
 */
import fs from "node:fs";
import path from "node:path";

const appRepo = process.argv[2] ?? "../yurt.skr";
const source = path.join(appRepo, "src/data/countries.ts");
const src = fs.readFileSync(source, "utf8");

const re =
  /\{\s*iso2:\s*"([A-Z]{2})",\s*iso3:\s*"([A-Z]{3})",\s*name:\s*"([^"]+)",\s*flag:\s*"([^"]+)",\s*continent:\s*"([^"]+)",\s*latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)\s*\}/g;

const countries = [];
for (const m of src.matchAll(re)) {
  countries.push({
    iso2: m[1], iso3: m[2], name: m[3], flag: m[4],
    continent: m[5], latitude: +m[6], longitude: +m[7],
  });
}

if (countries.length !== 195) {
  console.error(`Parsed ${countries.length} countries, expected 195. Refusing to write.`);
  process.exit(1);
}

fs.writeFileSync(
  "lib/countries.ts",
  `/**
 * 195 sovereign countries — generated from src/data/countries.ts in the app
 * repo by scripts/sync-countries.mjs. Do not hand-edit: the /t/<ISO2> routes
 * exist so the app's share links resolve, and the two lists have to agree.
 */

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  continent: Continent;
  latitude: number;
  longitude: number;
}

export const COUNTRIES: Country[] = ${JSON.stringify(countries, null, 2)};

const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function getCountryByIso2(code: string): Country | undefined {
  return BY_ISO2.get(code.toUpperCase());
}
`,
);

console.log(`lib/countries.ts — ${countries.length} countries`);
