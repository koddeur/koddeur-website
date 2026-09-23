"use client";

import { useEffect, useState } from "react";

type Lang = "fr" | "en";

function applyLang(lang: Lang) {
  document.documentElement.setAttribute("data-lang", lang);
  document.documentElement.setAttribute("lang", lang);
  window.localStorage.setItem("lang", lang);
}

export function LanguageToggle() {
  const [lang, setLang] = useState<Lang | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-lang");
    if (current === "en" || current === "fr") {
      setLang(current);
      return;
    }
    // The beforeInteractive init script didn't run (e.g. Next.js's client-side
    // recovery render after a deep notFound()) — resolve and apply it ourselves.
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("lang"); } catch {}
    const resolved: Lang = stored === "en" ? "en" : "fr";
    applyLang(resolved);
    setLang(resolved);
  }, []);

  function toggle() {
    const next: Lang = lang === "en" ? "fr" : "en";
    applyLang(next);
    setLang(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle lang-toggle"
      onClick={toggle}
      aria-label={lang === "en" ? "Passer en français" : "Switch to English"}
    >
      <span className="theme-icon lang-icon">{lang === "en" ? "FR" : "EN"}</span>
    </button>
  );
}
