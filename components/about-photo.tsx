"use client";

import Image from "next/image";
import { useRef } from "react";

export function AboutPhoto() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="about-photo" onClick={() => dialogRef.current?.showModal()} aria-label="Agrandir la photo">
        <Image src="/mael-beach.jpg" alt="Mael" width={280} height={280} />
      </button>
      <dialog ref={dialogRef} className="photo-lightbox" onClick={() => dialogRef.current?.close()}>
        <Image src="/mael-beach.jpg" alt="Mael" width={533} height={533} sizes="min(90vw, 90vh)" />
      </dialog>
    </>
  );
}
