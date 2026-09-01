/**
 * Deterministic territory colour.
 *
 * A territory is bought in two taps, so it has no colour chosen for it at
 * claim time. Deriving one from the owner's address means the map is never
 * grey where someone has paid, the same wallet reads as the same colour across
 * every country it holds, and no two-tap purchase has to stop and ask. Owners
 * can override it later from the banner editor.
 *
 * The hash and the ordering are `src/utils/ownerColor.ts` exactly, so a wallet
 * lands in the same slot in both clients. Only the six values differ: the
 * originals are held to L* 46–53 against white and sit at 4.2–5.5:1 on this
 * client's near-black ground, where the quietest owner reads as texture rather
 * than as ownership. These are the same hues re-derived in OKLab — hue held,
 * chroma pulled 8%, lightness re-pinned — landing inside L 0.716–0.721 and
 * 7.6–8.5:1. The rule the original was enforcing is what carried over; its
 * band was measured against a ground this client does not have.
 *
 * Kept in step with `app/app/tokens.css`, where the same six are the
 * `--owner-*` custom properties. This file is what a computed fill reads; the
 * stylesheet is what a static swatch reads.
 */

/**
 * Territory fills — six hues, one system.
 *
 * Ten saturated colours turned a busy board into confetti, and three of them
 * were the semantic palette exactly: an owner whose country was `danger` red
 * or `success` green made the map lie about state. None of these six is the
 * red, green or amber used for state.
 *
 * More than six owners simply repeat a hue. Telling two rivals apart is what
 * selecting a country is for; the map's job is to show that land is SPOKEN FOR.
 */
export const OWNER_COLORS = [
  "#70A1FF", // blue
  "#AD8FF7", // violet
  "#E67CB4", // magenta
  "#E38B58", // rust
  "#5EB5B5", // teal
  "#93B25C", // olive
] as const;

/**
 * FNV-1a over the address. Any stable hash works; this one is short, has no
 * dependencies, and spreads base58 input evenly across the palette.
 */
function hashAddress(address: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < address.length; i++) {
    hash ^= address.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** The colour a wallet's territories take until the owner picks another. */
export function colorForAddress(address: string): string {
  if (!address) return OWNER_COLORS[0];
  return OWNER_COLORS[hashAddress(address) % OWNER_COLORS.length];
}
