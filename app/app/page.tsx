/**
 * /app — the board.
 *
 * Phase 1 ships the frame the map goes into: a full-bleed canvas that owns
 * everything the bar leaves, and the inspector beside it. On a wide screen the
 * phone's bottom sheet is a persistent panel — there is no reason to hide a
 * country behind a sheet here, and keeping it mounted makes selecting a second
 * country a content swap rather than a dismiss-and-present. Below 860px it
 * collapses back into a sheet carrying the same content in the same order.
 */
export default function BoardPage() {
  return (
    <div className="ab-board">
      <div className="ab-board-canvas">
        <div className="ab-stub">
          <span className="ab-stub-step">Step 3 · the board</span>
          <h2>195 countries, one sheet.</h2>
          <p>
            The world map lands here: pan, zoom, hover, and a fly-to on arrival so a
            share link opens framed on its country. Claimed land carries its owner&rsquo;s
            colour; everything else is read by its lit coastline.
          </p>
        </div>
      </div>

      {/* The inspector's genuine empty state, not a placeholder — it is what
          the panel shows before anything is selected, and it will still be
          this once the map is real. */}
      <aside className="ab-board-side ab-empty" aria-label="Country inspector">
        <div className="ab-stack">
          <span className="ab-label">No selection</span>
          <h3>Pick a country.</h3>
        </div>
        <p className="ab-caption">
          Every one of the 195 is for sale. Choosing one shows who holds it, what their
          banner says, what it costs to take, and what the captain you displace walks
          away with.
        </p>
      </aside>
    </div>
  );
}
