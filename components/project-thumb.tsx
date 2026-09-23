"use client";

import { useEffect, useState } from "react";
import { Bi } from "@/components/i18n";

export function ProjectThumb({ image, alt }: { image: string; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className="project-thumb" onClick={() => setOpen(true)}>
        <img src={image} alt="" />
        <span className="sr-only"><Bi fr={`Agrandir l’image de ${alt}`} en={`Enlarge the image of ${alt}`} /></span>
      </button>
      {open ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)}>
          <button type="button" className="lightbox-close" onClick={() => setOpen(false)}>
            ✕<span className="sr-only"><Bi fr="Fermer" en="Close" /></span>
          </button>
          <img src={image} alt={alt} onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </>
  );
}
