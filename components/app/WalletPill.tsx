import { WalletIcon } from "./icons";

/**
 * The shell's one wallet control.
 *
 * Inert in Phase 1 — there is no adapter behind it yet, and a button that
 * opens a wallet chooser and then cannot do anything with the answer is worse
 * than one that says so. It ships at its real size and in its real slot so the
 * bar does not reflow when the adapter lands in Phase 2.
 */
export function WalletPill() {
  return (
    <button
      type="button"
      className="ab-btn ab-btn-ghost"
      disabled
      title="Wallet connection lands with the board's data"
    >
      <WalletIcon />
      <span>Connect wallet</span>
    </button>
  );
}
