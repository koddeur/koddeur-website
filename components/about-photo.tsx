"use client";

import Image from "next/image";
import { useRef } from "react";

export function AboutPhoto() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="about-photo" onClick={() => dialogRef.current?.showModal()} aria-label="Agrandir la photo">
        <Image src="/mael-football.jpg" alt="Mael Avennec" width={280} height={280} />
      </button>
      <dialog ref={dialogRef} className="photo-lightbox" onClick={() => dialogRef.current?.close()}>
        <Image src="/mael-football.jpg" alt="Mael Avennec" width={1600} height={1600} sizes="min(90vw, 90vh)" />
      </dialog>
    </>
  );
}
