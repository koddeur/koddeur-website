"use client";

import { useEffect, useState } from "react";

// Current site language (<html data-lang>), kept in sync when the FR / EN keys switch it.
// For text that can't use <Bi> (e.g. <option> labels, which only accept plain text).
export function useLang(): "fr" | "en" {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  useEffect(() => {
    const read = () => setLang(document.documentElement.getAttribute("data-lang") === "en" ? "en" : "fr");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
    return () => observer.disconnect();
  }, []);
  return lang;
}
