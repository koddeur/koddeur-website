"use client";

import { useState } from "react";
import { Bi } from "@/components/i18n";
import { articleUrl } from "@/lib/site";

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copy, setCopy] = useState<"idle" | "done" | "error">("idle");
  const url = articleUrl(slug);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopy("done");
    } catch {
      setCopy("error");
    }
    setTimeout(() => setCopy("idle"), 2000);
  }

  return (
    <>
      <a className="editor-action" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Facebook ↗</a>
      <a className="editor-action" href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title.replaceAll("*", ""))}`} target="_blank" rel="noreferrer">Twitter ↗</a>
      <button type="button" className="editor-action" onClick={copyLink} aria-live="polite">
        {copy === "done" ? <Bi fr="Lien copié ✓" en="Link copied ✓" /> : copy === "error" ? <Bi fr="Copie impossible" en="Copy failed" /> : <Bi fr="Copier le lien" en="Copy link" />}
      </button>
    </>
  );
}
