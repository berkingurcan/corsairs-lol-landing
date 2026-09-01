"use client";

/**
 * The shell's one wallet control.
 *
 * Three states in one slot, at one size, so the bar never reflows: connect,
 * connecting, connected. Connected opens a small panel rather than
 * disconnecting on click — a button labelled with your own address that logs
 * you out when you press it is a trap, and the balance has to live somewhere
 * that is not a screen you have to navigate to.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { formatAmount, shortenAddress } from "@/lib/board/config";
import { colorForAddress } from "@/lib/board/ownerColor";
import { useWallet } from "@/lib/wallet/WalletProvider";

import { WalletIcon } from "./icons";

export function WalletPill() {
  const { publicKey, connected, connecting, balance, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  if (!connected) {
    return (
      <button
        type="button"
        className="ab-btn ab-btn-ghost"
        onClick={() => void connect()}
        disabled={connecting}
      >
        <WalletIcon />
        <span>{connecting ? "Connecting…" : "Connect wallet"}</span>
      </button>
    );
  }

  const address = publicKey!;

  return (
    <div className="ab-wallet" ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className="ab-btn ab-btn-ghost"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {/* The wallet's own colour, which is the same colour its countries
            carry on the board. Two places, one derivation. */}
        <span
          className="ab-wallet-dot"
          style={{ background: colorForAddress(address) }}
          aria-hidden="true"
        />
        <span className="ab-mono">{shortenAddress(address)}</span>
      </button>

      {open && (
        <div className="ab-pop" role="dialog" aria-label="Wallet">
          <div className="ab-stack">
            <span className="ab-label">Balance</span>
            {/* Null is "not read yet", not zero. A failed balance read is a
                degraded display, never a blocked purchase. */}
            <span className="ab-figure">
              {balance === null ? "—" : formatAmount(balance)}
            </span>
            <span className="ab-caption">SOL</span>
          </div>

          <hr className="ab-rule" />

          <div className="ab-stack">
            <span className="ab-label">Address</span>
            <span className="ab-mono ab-wallet-full">{address}</span>
          </div>

          <button
            type="button"
            className="ab-btn ab-btn-ghost ab-btn-block"
            onClick={() => {
              void disconnect();
              close(true);
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
