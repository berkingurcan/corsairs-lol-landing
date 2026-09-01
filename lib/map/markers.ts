/**
 * Island micro-states, placed.
 *
 * Natural Earth's 1:110m admin-0 set has no polygon for these — at that
 * generalisation Malta and Nauru are smaller than the simplification
 * tolerance — so they are drawn as a beacon on their declared centroid rather
 * than as an outline. 167 polygons plus 28 beacons is the whole board.
 *
 * Computed here rather than baked into the generated file, because the
 * centroids already live in `lib/countries.ts` and a second copy of the same
 * 28 coordinates is a second copy to keep in step.
 *
 * ⚠ Imports the geometry, so this module carries the same rule: reachable only
 * through the board's lazy chunk.
 */
import { COUNTRIES } from "@/lib/countries";

import { MARKER_ONLY_COUNTRIES, projectToMap } from "./geometry";

export interface MapMarker {
  iso2: string;
  /** Position in viewBox units. */
  x: number;
  y: number;
}

export const MARKER_POSITIONS: MapMarker[] = MARKER_ONLY_COUNTRIES.map((iso2) => {
  const country = COUNTRIES.find((c) => c.iso2 === iso2);
  const point = country ? projectToMap(country.longitude, country.latitude) : { x: 0, y: 0 };
  return { iso2, x: point.x, y: point.y };
});

/** Same beacons, keyed — selection and fly-to both look one up by code. */
export const MARKER_BY_CODE = new Map(MARKER_POSITIONS.map((m) => [m.iso2, m]));
