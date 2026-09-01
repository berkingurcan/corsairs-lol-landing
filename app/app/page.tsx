/**
 * /app — the board.
 *
 * A thin server shell over a client canvas: selection, zoom and the lens are
 * all live state, and the map geometry is 120 KB that only this route may
 * load. Everything interesting is in `BoardCanvas`.
 */
import { BoardCanvas } from "@/components/app/board/BoardCanvas";

// Route-scoped: the board is the only surface that draws a map.
import "./map.css";

export default function BoardPage() {
  return <BoardCanvas />;
}
