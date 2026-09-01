"use client";

/**
 * The board, as a browser draws it.
 *
 * Ported from the `corsairs-web` branch's WorldMap and restyled. The note that
 * came with it is the reason it is only this long:
 *
 *   The Seeker app's WorldMap is 1,822 lines, and almost all of them exist to
 *   work around one fact — react-native-svg's Android SvgView rasterises its
 *   whole subtree into a cached Bitmap, and touching `viewBox` throws that
 *   cache away. Hence the two stacked layers, the power-of-two stroke bands,
 *   the concatenated paths, the deferred detail commit, and a hand-written hit
 *   test. None of that applies here. This is real DOM SVG: the browser
 *   composites a retained scene graph, `vector-effect="non-scaling-stroke"`
 *   keeps a hairline a hairline at every zoom, and a `<path>` takes a click by
 *   itself. So the apparatus collapses to one element per country.
 *
 * The one rule that DOES carry over is the reason the phone version is built
 * the way it is: never do per-frame work in the framework. Panning mutates the
 * group's `transform` through a ref inside a rAF, so a drag costs one
 * attribute write per frame and zero React renders. State is committed only
 * when the gesture ends, and only because things outside the SVG — the zoom
 * readout, the beacon scale — need to know.
 *
 * The restyle is the inversion. Graphite's board is a near-white ocean under
 * pale land; on this ground that is a lightbox. Here unclaimed land sits a
 * hair above the page and is read entirely by its LIT coastline, which is
 * BRAND.md rule 7 — "map drama comes from country boundaries" — arrived at
 * from the other direction. Claimed land takes its owner's hue at full
 * opacity and its boundary goes dark, so adjacent owners separate by a seam
 * rather than by a shared highlight.
 */
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
} from "react";

import type { Territory } from "@/lib/board/types";
import {
  COUNTRY_BBOX,
  COUNTRY_PATHS,
  MAP_VIEWBOX,
  NEUTRAL_LAND_PATH,
} from "@/lib/map/geometry";
import { MARKER_BY_CODE, MARKER_POSITIONS } from "@/lib/map/markers";

const { width: MAP_W, height: MAP_H } = MAP_VIEWBOX;

const MIN_ZOOM = 1;
const MAX_ZOOM = 64;

/** Beacon radius in viewBox units at 1x; scaled down as the map zooms in. */
const MARKER_R = 4.5;

export type BoardFilter = "all" | "claimed" | "mine";

export interface WorldMapHandle {
  /** Frame a country, centred, at a readable zoom. */
  flyTo(iso2: string): void;
  reset(): void;
}

interface MapView {
  k: number;
  x: number;
  y: number;
}

interface WorldMapProps {
  territories: Map<string, Territory>;
  selected: string | null;
  /** Wallet address of the viewer, so their own land can be outlined. */
  mine: string | null;
  filter: BoardFilter;
  onSelect(iso2: string | null): void;
  handleRef?: RefObject<WorldMapHandle | null>;
  /**
   * Fired once the imperative handle is live. The board arrives from a share
   * link carrying `?c=XX`, and the parent cannot fly to it until this chunk
   * has actually loaded — which, being a lazy import, is at an unknowable
   * moment after the parent's own effects have run.
   */
  onReady?(): void;
}

const ISO_CODES = Object.keys(COUNTRY_PATHS);

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

// ─────────────────────────────────────────────────────────── the country layer

interface Paint {
  fill: string | undefined;
  claimed: boolean;
  mine: boolean;
  dimmed: boolean;
}

/**
 * Split out and memoised so hovering does not re-render 195 paths.
 *
 * The hover HIGHLIGHT is pure CSS — `:hover` on the path — so React only ever
 * hears about hover for the readout chip, which is one small element. This
 * layer re-renders when the board polls or the selection moves, and at no
 * other time.
 */
const MapLayer = memo(function MapLayer({
  paints,
  selected,
  markerScale,
  onSelect,
  setHovered,
  panning,
}: {
  paints: Map<string, Paint>;
  selected: string | null;
  markerScale: number;
  onSelect(iso2: string): void;
  setHovered: Dispatch<SetStateAction<string | null>>;
  panning: RefObject<boolean>;
}) {
  // A drag that ends over a country is a pan, not a click on it.
  const select = (iso2: string) => {
    if (panning.current) return;
    onSelect(iso2);
  };

  const selectedPath = selected ? COUNTRY_PATHS[selected] : undefined;
  const selectedMarker = selected ? MARKER_BY_CODE.get(selected) : undefined;

  return (
    <>
      {/* Antarctica and other non-sovereign terrain: visible, never selectable. */}
      <path d={NEUTRAL_LAND_PATH} className="ab-map-neutral" />

      {ISO_CODES.map((iso2) => {
        const paint = paints.get(iso2)!;
        return (
          <path
            key={iso2}
            d={COUNTRY_PATHS[iso2]}
            fill={paint.fill}
            className={
              "ab-map-country" +
              (paint.claimed ? " is-claimed" : "") +
              (paint.mine ? " is-mine" : "") +
              (paint.dimmed ? " is-dimmed" : "")
            }
            onPointerEnter={() => setHovered(iso2)}
            // Guarded rather than cleared outright: on some browsers the enter
            // for the next country lands before the leave for this one, and an
            // unguarded null would blank the readout the moment it was right.
            onPointerLeave={() => setHovered((h) => (h === iso2 ? null : h))}
            onClick={() => select(iso2)}
          />
        );
      })}

      {/* Micro-states have no polygon at this generalisation — see markers.ts */}
      {MARKER_POSITIONS.map((marker) => {
        const paint = paints.get(marker.iso2)!;
        return (
          <circle
            key={marker.iso2}
            cx={marker.x}
            cy={marker.y}
            r={MARKER_R * markerScale}
            fill={paint.fill}
            className={
              "ab-map-beacon" +
              (paint.claimed ? " is-claimed" : "") +
              (paint.mine ? " is-mine" : "") +
              (paint.dimmed ? " is-dimmed" : "")
            }
            onPointerEnter={() => setHovered(marker.iso2)}
            onPointerLeave={() => setHovered((h) => (h === marker.iso2 ? null : h))}
            onClick={() => select(marker.iso2)}
          />
        );
      })}

      {/* The selection ring is drawn again, last, over a dark casing.
          Last, because SVG has no z-index: painted in place, a ring on a small
          country is overdrawn by whichever neighbour comes after it in the
          list. Over a casing, because a bare silver ring is exactly what a
          country the viewer OWNS already wears — see `--m-selection-halo`. */}
      {selectedPath && (
        <>
          <path d={selectedPath} className="ab-map-ring-casing" pointerEvents="none" />
          <path d={selectedPath} className="ab-map-ring" pointerEvents="none" />
        </>
      )}
      {selectedMarker && (
        <>
          <circle
            cx={selectedMarker.x}
            cy={selectedMarker.y}
            r={MARKER_R * markerScale * 1.7}
            className="ab-map-ring-casing"
            pointerEvents="none"
          />
          <circle
            cx={selectedMarker.x}
            cy={selectedMarker.y}
            r={MARKER_R * markerScale * 1.7}
            className="ab-map-ring"
            pointerEvents="none"
          />
        </>
      )}
    </>
  );
});

// ─────────────────────────────────────────────────────────────────── the map

export function WorldMap({
  territories,
  selected,
  mine,
  filter,
  onSelect,
  handleRef,
  onReady,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  /** The live view. Mutated during a gesture; state is the committed copy. */
  const view = useRef<MapView>({ k: 1, x: 0, y: 0 });
  const [committed, setCommitted] = useState<MapView>({ k: 1, x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  /** Writes the transform. The only thing a pan frame is allowed to do. */
  const paint = useCallback(() => {
    frame.current = null;
    const { k, x, y } = view.current;
    gRef.current?.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
  }, []);

  const schedule = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(paint);
  }, [paint]);

  const commit = useCallback(() => setCommitted({ ...view.current }), []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  /**
   * Client pixels to viewBox units.
   *
   * Through `getScreenCTM` rather than by scaling against the element's width,
   * because `preserveAspectRatio` letterboxes the 2.5:1 board inside whatever
   * box the page gives it — the two are only the same number when the aspect
   * ratios happen to match, and then only by accident.
   */
  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(ctm.inverse());
  }, []);

  /** Zoom about a fixed point, so what is under the cursor stays there. */
  const zoomAbout = useCallback(
    (vx: number, vy: number, factor: number) => {
      const current = view.current;
      const k = clamp(current.k * factor, MIN_ZOOM, MAX_ZOOM);
      if (k === current.k) return;
      // The world point under (vx, vy) must not move.
      view.current = {
        k,
        x: vx - ((vx - current.x) / current.k) * k,
        y: vy - ((vy - current.y) / current.k) * k,
      };
      schedule();
    },
    [schedule],
  );

  // ── Wheel / trackpad ──
  // Registered by hand because React's synthetic wheel listener is passive,
  // and a passive listener cannot preventDefault — so the page would scroll
  // underneath the map while zooming it.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let idle: ReturnType<typeof setTimeout> | null = null;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = toSvg(event.clientX, event.clientY);
      if (!point) return;
      // Trackpads report small continuous deltas, mice one big notch. Damping
      // by the exponent rather than branching on deltaMode keeps both smooth.
      zoomAbout(point.x, point.y, Math.exp(-event.deltaY * 0.002));
      if (idle) clearTimeout(idle);
      idle = setTimeout(commit, 120);
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", onWheel);
      if (idle) clearTimeout(idle);
    };
  }, [toSvg, zoomAbout, commit]);

  // ── Drag to pan ──
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  /** Read by the country layer, which must not treat a drag's end as a click. */
  const panning = useRef(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const point = toSvg(event.clientX, event.clientY);
      if (!point) return;
      drag.current = { id: event.pointerId, x: point.x, y: point.y };
      panning.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [toSvg],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const active = drag.current;
      if (!active || active.id !== event.pointerId) return;
      const point = toSvg(event.clientX, event.clientY);
      if (!point) return;
      const dx = point.x - active.x;
      const dy = point.y - active.y;
      // A few units of slop, so a click with an unsteady hand is still a click.
      if (!panning.current && Math.hypot(dx, dy) > 3) panning.current = true;
      if (!panning.current) return;
      view.current = { ...view.current, x: view.current.x + dx, y: view.current.y + dy };
      active.x = point.x;
      active.y = point.y;
      schedule();
    },
    [toSvg, schedule],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const active = drag.current;
      if (!active || active.id !== event.pointerId) return;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (panning.current) {
        commit();
        // Cleared on the next frame, so the click that ends this drag is still
        // suppressed — the click event fires after pointerup.
        requestAnimationFrame(() => {
          panning.current = false;
        });
      }
    },
    [commit],
  );

  // ── Fly to ──
  const flyTo = useCallback(
    (iso2: string) => {
      const box = COUNTRY_BBOX[iso2];
      const marker = MARKER_BY_CODE.get(iso2);

      let cx: number;
      let cy: number;
      let k: number;

      if (box) {
        const [x0, y0, x1, y1] = box;
        cx = (x0 + x1) / 2;
        cy = (y0 + y1) / 2;
        // Frame it with room to breathe, and never zoom past what is useful.
        const fit = Math.min(MAP_W / Math.max(x1 - x0, 1), MAP_H / Math.max(y1 - y0, 1));
        k = clamp(fit * 0.45, 2, 24);
      } else if (marker) {
        cx = marker.x;
        cy = marker.y;
        k = 16;
      } else {
        return;
      }

      view.current = { k, x: MAP_W / 2 - cx * k, y: MAP_H / 2 - cy * k };
      schedule();
      commit();
    },
    [schedule, commit],
  );

  const reset = useCallback(() => {
    view.current = { k: 1, x: 0, y: 0 };
    schedule();
    commit();
  }, [schedule, commit]);

  useImperativeHandle(handleRef, () => ({ flyTo, reset }), [flyTo, reset]);

  // `useImperativeHandle` writes the ref in the layout phase, so by the time
  // this runs the parent's `handleRef.current` is set.
  useEffect(() => onReady?.(), [onReady]);

  // ── Keyboard ──
  // A map you can only reach with a mouse is a map half the desktop cannot use.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      const step = 60;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        view.current = {
          ...view.current,
          x: view.current.x + move[0],
          y: view.current.y + move[1],
        };
        schedule();
        commit();
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAbout(MAP_W / 2, MAP_H / 2, 1.4);
        commit();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomAbout(MAP_W / 2, MAP_H / 2, 1 / 1.4);
        commit();
      } else if (event.key === "0") {
        event.preventDefault();
        reset();
      } else if (event.key === "Escape") {
        onSelect(null);
      }
    },
    [schedule, commit, zoomAbout, reset, onSelect],
  );

  // ── Paints ──
  // Recomputed only when the board, the viewer or the lens changes — never per
  // frame, and never on hover.
  const paints = useMemo(() => {
    const map = new Map<string, Paint>();
    for (const iso2 of [...ISO_CODES, ...MARKER_POSITIONS.map((m) => m.iso2)]) {
      const territory = territories.get(iso2);
      const claimed = Boolean(territory?.isClaimed);
      const isMine = Boolean(mine && territory?.ownerAddress === mine);
      map.set(iso2, {
        // Undefined leaves the fill to CSS, which is where the unclaimed
        // value belongs — an owner colour is data, `--m-unclaimed` is design.
        fill: claimed && territory?.color ? territory.color : undefined,
        claimed,
        mine: isMine,
        dimmed:
          (filter === "claimed" && !claimed) || (filter === "mine" && !isMine),
      });
    }
    return map;
  }, [territories, mine, filter]);

  const markerScale = 1 / Math.sqrt(committed.k);
  const dirty = committed.k !== 1 || committed.x !== 0 || committed.y !== 0;

  return (
    <div className="ab-map">
      <svg
        ref={svgRef}
        className="ab-map-svg"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label="World map. Arrow keys pan, plus and minus zoom, 0 resets, Escape clears the selection."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="var(--m-ocean)" />
        <g ref={gRef}>
          <MapLayer
            paints={paints}
            selected={selected}
            markerScale={markerScale}
            onSelect={onSelect}
            setHovered={setHovered}
            panning={panning}
          />
        </g>
      </svg>

      <div className="ab-map-hud">
        {hovered ? <HoverChip iso2={hovered} territories={territories} /> : <span />}

        <div className="ab-zoom" role="group" aria-label="Zoom">
          <button
            type="button"
            onClick={() => {
              zoomAbout(MAP_W / 2, MAP_H / 2, 1 / 1.4);
              commit();
            }}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="ab-zoom-level" aria-live="off">
            {committed.k < 10 ? committed.k.toFixed(1) : Math.round(committed.k)}×
          </span>
          <button
            type="button"
            onClick={() => {
              zoomAbout(MAP_W / 2, MAP_H / 2, 1.4);
              commit();
            }}
            aria-label="Zoom in"
          >
            +
          </button>
          {/* Only once there is something to reset. A control that does nothing
              is a control you learn to ignore. */}
          {dirty && (
            <button type="button" className="ab-zoom-reset" onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** What the pointer is over. The phone has no room for this and no pointer. */
function HoverChip({
  iso2,
  territories,
}: {
  iso2: string;
  territories: Map<string, Territory>;
}) {
  const territory = territories.get(iso2);
  return (
    <span className="ab-hover">
      <b>{iso2}</b>
      {territory?.isClaimed ? (
        <span>{territory.title || "held"}</span>
      ) : (
        <span className="ab-hover-open">open</span>
      )}
    </span>
  );
}
