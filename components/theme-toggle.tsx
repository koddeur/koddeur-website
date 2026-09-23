"use client";

import { useEffect, useState } from "react";
import { Bi } from "@/components/i18n";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
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
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="theme-icon">{theme === "light" ? "☀" : "☾"}</span>
      <span className="sr-only">
        {theme === "light" ? <Bi fr="Activer le mode sombre" en="Enable dark mode" /> : <Bi fr="Activer le mode clair" en="Enable light mode" />}
      </span>
    </button>
  );
}
