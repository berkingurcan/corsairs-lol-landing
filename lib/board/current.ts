/**
 * Which adapter this build talks to.
 *
 * This used to be a marked line inside `BoardProvider.tsx`, and it moved out
 * the moment a second surface needed to read the board: the marketing page
 * asks for one snapshot on arrival, which is not a reason to mount a provider
 * that polls, and it is absolutely not a reason to name `mockAdapter` in a
 * second place. Two files choosing an adapter is a build that goes half live.
 *
 * So the seam is unchanged and the promise it makes is now literally true —
 * one line, one file, every consumer:
 *
 *   import { httpAdapter } from "./http";
 *   export const adapter: BoardAdapter = httpAdapter;
 *
 * Read the note on `assertIntentIsSafe` in http.ts before you change it.
 *
 * Kept free of React on purpose. `snapshot.ts` pulls this in through a dynamic
 * import to keep it off the landing page's first paint, and that only works
 * while importing it costs nothing but the adapter itself.
 */
import type { BoardAdapter } from "./adapter";
import { mockAdapter } from "./mock";

export const adapter: BoardAdapter = mockAdapter;
