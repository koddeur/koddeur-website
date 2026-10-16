"use client";

import { applyLang, type Lang } from "@/components/language-toggle";

// Keyboard key that switches the site to one language. The active key's LED is driven
// by the <html data-lang> attribute in CSS, so the FR and EN keys never need shared state.
export function LanguageKey({ lang, className }: { lang: Lang; className: string }) {
  return (
    <button type="button" className={className} onClick={() => applyLang(lang)} aria-label={lang === "fr" ? "Passer en français" : "Switch to English"}>
      {lang.toUpperCase()}
    </button>
  );
}
