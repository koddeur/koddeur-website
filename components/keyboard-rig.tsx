"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Bi } from "@/components/i18n";

// Lets the esc key slide the laptop (screen + keyboard) up, leaving only its bottom edge on screen,
// and reveals the easter egg hidden behind it. The recall tab or the Escape key brings it back.
// `onEscape` runs first and returns true when it handled the press (e.g. clearing a selection).
const PEEK = 16; // px of the keyboard's bottom edge left visible once stowed

const StowContext = createContext<() => void>(() => {});

export function KeyboardRig({ children, egg, onEscape }: { children: ReactNode; egg: ReactNode; onEscape?: () => boolean }) {
  const rig = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number | null>(null);
  const stowed = offset !== null;

  // Distance that brings the keyboard's bottom edge to PEEK px below the top of the viewport.
  const measure = useCallback((current: number) => {
    const box = rig.current?.getBoundingClientRect();
    return box ? -(box.bottom - current - PEEK) : 0;
  }, []);

  const recall = useCallback(() => setOffset(null), []);
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);
  const escape = useCallback(() => {
    if (onEscapeRef.current?.()) return;
    setOffset(measure(0));
  }, [measure]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (rig.current?.dataset.stowed !== undefined) recall();
      else escape();
    };
    const onResize = () => setOffset((current) => (current === null ? null : measure(current)));
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, escape, recall]);

  return (
    <div className="keyboard-area">
      <div className="easter-egg" inert={!stowed}>{egg}</div>
      <div ref={rig} className="keyboard-rig" data-stowed={stowed || undefined} style={stowed ? { transform: `translateY(${offset}px)` } : undefined}>
        <StowContext.Provider value={escape}>
          <div inert={stowed}>{children}</div>
        </StowContext.Provider>
        <button type="button" className="keyboard-recall" onClick={recall} inert={!stowed}>
          <span aria-hidden="true">▾</span>
          <span className="sr-only"><Bi fr="Ressortir le clavier" en="Bring the keyboard back" /></span>
        </button>
      </div>
    </div>
  );
}

export function EscKey({ className }: { className: string }) {
  const escape = useContext(StowContext);
  return (
    <button type="button" className={className} onClick={escape}>
      esc
      <span className="sr-only"><Bi fr="Ranger le clavier" en="Put the keyboard away" /></span>
    </button>
  );
}
