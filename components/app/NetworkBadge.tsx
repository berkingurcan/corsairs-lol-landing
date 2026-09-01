"use client";

/**
 * What this board actually is.
 *
 * Against the real API it says Mainnet, because every price on the board is
 * real SOL and that is worth stating rather than assuming. Against the mock it
 * says so — loudly, in the warning colour — because a board showing invented
 * prices must never be mistaken for one showing real ones. It doubles as the
 * failure switch, which is the same fact wearing a control: the only build
 * where you can arm a failure is the build where nothing is at stake.
 */
import { useEffect, useState, useSyncExternalStore } from "react";

import { useBoard } from "@/lib/board/BoardProvider";
import {
  MOCK_FAILURES,
  getMockFailure,
  setMockFailure,
  subscribeMockFailure,
} from "@/lib/board/mockFailures";

export function NetworkBadge() {
  const { adapter } = useBoard();
  const armed = useSyncExternalStore(subscribeMockFailure, getMockFailure, () => null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (adapter.kind !== "mock") {
    return <span className="ab-net">Mainnet</span>;
  }

  return (
    <div className="ab-wallet">
      <button
        type="button"
        className="ab-net is-mock"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {armed ? "Mock · armed" : "Mock board"}
      </button>

      {open && (
        <div className="ab-pop" role="dialog" aria-label="Mock board">
          <div className="ab-stack">
            <span className="ab-label">Mock board</span>
            <p className="ab-caption">
              Every price, owner and banner here is invented and seeded, so the board is
              the same on every reload. Nothing settles and nothing is charged.
            </p>
          </div>

          <hr className="ab-rule" />

          <div className="ab-stack">
            <span className="ab-label">Arm a failure</span>
            <p className="ab-caption">Fires once on the next purchase, then disarms.</p>
          </div>

          <div className="ab-dev-list">
            <button
              type="button"
              className={"ab-chip" + (armed === null ? " is-on" : "")}
              onClick={() => setMockFailure(null)}
            >
              None
            </button>
            {MOCK_FAILURES.map((failure) => (
              <button
                key={failure.value}
                type="button"
                className={"ab-chip" + (armed === failure.value ? " is-on" : "")}
                onClick={() => setMockFailure(failure.value)}
              >
                {failure.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
