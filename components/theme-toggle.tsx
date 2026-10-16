"use client";

import { useEffect, useState } from "react";
import { Bi } from "@/components/i18n";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme", theme);
}

export function ThemeToggle({ className = "theme-toggle" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
      return;
    }
    // The beforeInteractive init script didn't run (e.g. Next.js's client-side
    // recovery render after a deep notFound()) — resolve and apply it ourselves.
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("theme"); } catch {}
    const resolved: Theme = stored === "light" || stored === "dark" ? stored : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(resolved);
    setTheme(resolved);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button type="button" className={className} onClick={toggle}>
      {/* SVG rather than ☀/☾: iOS renders those characters as colour emoji. */}
      <span className="theme-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          {theme === "light" ? (
            <>
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
            </>
          ) : (
            <path d="M13 9.6A5.5 5.5 0 1 1 6.4 3a4.5 4.5 0 0 0 6.6 6.6z" />
          )}
        </svg>
      </span>
      <span className="sr-only">
        {theme === "light" ? <Bi fr="Activer le mode sombre" en="Enable dark mode" /> : <Bi fr="Activer le mode clair" en="Enable light mode" />}
      </span>
    </button>
  );
}
