"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

/**
 * Light/dark switch.
 *
 * Which icon and label are showing is decided in CSS off `data-theme` and
 * `prefers-color-scheme`, not in React state, so the button is already correct
 * in the static HTML — before hydration, and with JavaScript disabled it simply
 * reads as the current theme. All this component adds is the click.
 */
export function ThemeToggle() {
  useEffect(() => {
    // Until the reader chooses, keep following the system, so a scheduled OS
    // theme change still moves the page. After they choose, stop.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if (!localStorage.getItem("theme")) delete document.documentElement.dataset.theme;
      } catch {
        /* private mode — nothing was stored, so there is nothing to unset */
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const current: Theme =
      (root.dataset.theme as Theme | undefined) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next: Theme = current === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* the page still switches; the choice just will not survive a reload */
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} title="Switch colour theme">
      <svg className="t-light" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.2 14.3A8.2 8.2 0 0 1 9.7 3.8a8.5 8.5 0 1 0 10.5 10.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="t-dark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="visually-hidden t-light">Switch to dark theme</span>
      <span className="visually-hidden t-dark">Switch to light theme</span>
    </button>
  );
}
