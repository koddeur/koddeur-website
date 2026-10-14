"use client";

import { useRef } from "react";

// Article image that opens larger in a native <dialog> (Escape, click or × closes it).
export function ZoomableImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className="zoomable-image" onClick={() => dialogRef.current?.showModal()} aria-label={alt ? `Agrandir l'image : ${alt}` : "Agrandir l'image"}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </button>
      <dialog ref={dialogRef} className="image-lightbox" onClick={close} aria-label={alt || caption || "Image agrandie"}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        {caption ? <p className="image-lightbox-caption">{caption}</p> : null}
        <button type="button" className="image-lightbox-close" onClick={close} aria-label="Fermer">×</button>
      </dialog>
    </>
  );
}
