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
 * Fills.
 *
 * Drawn first, and they carry the pointer: a country is clicked on its body,
 * not on its outline.
 *
 * The colour arrives as an inline STYLE and not as a `fill` attribute, which
 * is not a stylistic preference — a presentation attribute is the lowest
 * priority author style there is, so `.ab-map-country { fill: … }` in the
 * stylesheet silently beat every owner colour and the whole board rendered
 * unclaimed. An inline style outranks the rule; the rule stays as the default
 * for the countries nobody has bought.
 */
const MapFills = memo(function MapFills({
  paints,
  markerScale,
  onSelect,
  setHovered,
  panning,
}: {
  paints: Map<string, Paint>;
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

  return (
    <g>
      {/* Antarctica and other non-sovereign terrain: visible, never selectable. */}
      <path d={NEUTRAL_LAND_PATH} className="ab-map-neutral" />

      {ISO_CODES.map((iso2) => {
        const paint = paints.get(iso2)!;
        return (
          <path
            key={iso2}
            d={COUNTRY_PATHS[iso2]}
            style={paint.fill ? { fill: paint.fill } : undefined}
            className={"ab-map-country" + (paint.dimmed ? " is-dimmed" : "")}
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
            style={paint.fill ? { fill: paint.fill } : undefined}
            className={"ab-map-beacon" + (paint.dimmed ? " is-dimmed" : "")}
            onPointerEnter={() => setHovered(marker.iso2)}
            onPointerLeave={() => setHovered((h) => (h === marker.iso2 ? null : h))}
            onClick={() => select(marker.iso2)}
          />
        );
      })}
    </g>
  );
});

/**
 * Boundaries, as their own layer above every fill.
 *
 * This is the fix for borders that showed on one side of a country and not the
 * other. Drawn per country alongside its fill, a boundary is painted and then
 * overpainted by whichever neighbour happens to come later in the list — and
 * the list is alphabetical by ISO code, so which of two countries won a shared
 * border was arbitrary. Worse, the two carried different stroke colours, so a
 * country's outline changed colour partway round depending on who its
 * neighbours were.
 *
 * Fills first, then every boundary on top of all of them: nothing can cover a
 * line any more, and a country's outline is one continuous colour.
 *
 * One colour, too. Graphite gives `divider` and `rivalStroke` the same value —
 * both are the ocean, cutting between land masses on a light board. The
 * faithful inversion is one lit hairline everywhere, and it lets the fill do
 * the job the fill is for: claimed land is the land that is lit.
 */
const MapBorders = memo(function MapBorders({
  paints,
  markerScale,
}: {
  paints: Map<string, Paint>;
  markerScale: number;
}) {
  return (
    <g className="ab-map-borders">
      {ISO_CODES.map((iso2) => (
        <path key={iso2} d={COUNTRY_PATHS[iso2]} className="ab-map-border" />
      ))}
      {MARKER_POSITIONS.map((marker) => (
        <circle
          key={marker.iso2}
          cx={marker.x}
          cy={marker.y}
          r={MARKER_R * markerScale}
          className="ab-map-border"
        />
      ))}

      {/* Yours, dashed — see `--m-selection-halo` for why kind and not weight. */}
      {ISO_CODES.filter((iso2) => paints.get(iso2)!.mine).map((iso2) => (
        <path key={iso2} d={COUNTRY_PATHS[iso2]} className="ab-map-mine" />
      ))}
      {MARKER_POSITIONS.filter((m) => paints.get(m.iso2)!.mine).map((marker) => (
        <circle
          key={marker.iso2}
          cx={marker.x}
          cy={marker.y}
          r={MARKER_R * markerScale}
          className="ab-map-mine"
        />
      ))}
    </g>
  );
});

/**
 * Hover and selection, last of all.
 *
 * Not memoised, and deliberately outside both layers above: hover changes on
 * every pointer move across the board, and re-rendering 334 paths for it would
 * be the one piece of per-frame framework work this component exists to avoid.
 * Here it costs at most three elements.
 */
function MapMarks({
  hovered,
  selected,
  markerScale,
}: {
  hovered: string | null;
  selected: string | null;
  markerScale: number;
}) {
  const outline = (iso2: string, className: string) => {
    const path = COUNTRY_PATHS[iso2];
    if (path) return <path d={path} className={className} />;
    const marker = MARKER_BY_CODE.get(iso2);
    if (!marker) return null;
    return <circle cx={marker.x} cy={marker.y} r={MARKER_R * markerScale * 1.7} className={className} />;
  };

  return (
    <g className="ab-map-marks">
      {hovered && hovered !== selected && outline(hovered, "ab-map-hover")}
      {/* The ring sits over a dark casing: a bare silver outline is exactly
          what a country you OWN already wears, and without the cut between
          them neither signal wins. See `--m-selection-halo`. */}
      {selected && outline(selected, "ab-map-ring-casing")}
      {selected && outline(selected, "ab-map-ring")}
    </g>
  );
}

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
        // Undefined leaves the fill to CSS, which is where the unclaimed value
        // belongs — an owner colour is data, `--m-unclaimed` is design. A
        // claimed country always gets a lit fill, even if the server sent no
        // colour: land that is spoken for must never read as open.
        fill: claimed ? territory?.color || "var(--m-claimed-fallback)" : undefined,
        claimed,
        mine: isMine,
        dimmed:
          (filter === "claimed" && !claimed) || (filter === "mine" && !isMine),
      });
    }
    return map;
  }, [territories, mine, filter]);

  /**
   * Beacon size, damped against zoom.
   *
   * A beacon's radius is in viewBox units inside the scaled group, so left
   * alone it would grow linearly with zoom and a micro-state would swallow its
   * own ocean at 64x. The square root keeps it findable when zoomed out and
   * proportionate when zoomed in — the stroke around it is non-scaling either
   * way, so the ring stays a hairline.
   */
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
          <MapFills
            paints={paints}
            markerScale={markerScale}
            onSelect={onSelect}
            setHovered={setHovered}
            panning={panning}
          />
          <MapBorders paints={paints} markerScale={markerScale} />
          <MapMarks hovered={hovered} selected={selected} markerScale={markerScale} />
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
