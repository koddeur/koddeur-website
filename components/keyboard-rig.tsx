"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Bi } from "@/components/i18n";

// Slides the laptop (screen + keyboard) off screen to reveal what is behind it, leaving PEEK px of it
// visible at the edge: ▾ / ArrowDown slides it up (contact form), ◂ / ArrowLeft slides it right
// (projects), ▸ / ArrowRight slides it left (about). The recall tab, Escape or the opposite arrow
// brings it back. Otherwise esc (on screen or physical) is handed to `onEscape`, and every arrow press
// (on screen or physical) goes to `onArrow` first, which returns true when it handled it.
const PEEK = 16;

export type Stow = "up" | "right" | "left";

const RigContext = createContext<{ escape: () => void; arrow: (key: string) => void }>({ escape: () => {}, arrow: () => {} });

// Arrow that undoes each slide, and the slide each arrow triggers.
const RECALL_KEY: Record<Stow, string> = { up: "ArrowUp", right: "ArrowRight", left: "ArrowLeft" };
const STOW_KEY: Record<string, Stow> = { ArrowDown: "up", ArrowLeft: "right", ArrowRight: "left" };

type Props = { children: ReactNode; contact: ReactNode; projects: ReactNode; about: ReactNode; onEscape?: () => void; onArrow?: (key: string) => boolean };

export function KeyboardRig({ children, contact, projects, about, onEscape, onArrow }: Props) {
  const rig = useRef<HTMLDivElement>(null);
  const [stowed, setStowed] = useState<{ direction: Stow; x: number; y: number } | null>(null);
  const stowedRef = useRef(stowed);
  useEffect(() => {
    stowedRef.current = stowed;
  }, [stowed]);

  // Offset that leaves PEEK px of the laptop inside the viewport, from its resting position. The
  // translation applied right now (possibly mid-transition after fast key presses) is read from the
  // computed style and removed, so the result never depends on where an animation happens to be.
  const measure = useCallback((direction: Stow) => {
    const element = rig.current;
    if (!element) return { x: 0, y: 0 };
    const box = element.getBoundingClientRect();
    const shift = new DOMMatrixReadOnly(getComputedStyle(element).transform === "none" ? undefined : getComputedStyle(element).transform);
    const left = box.left - shift.m41, right = box.right - shift.m41, bottom = box.bottom - shift.m42;
    if (direction === "up") return { x: 0, y: -(bottom - PEEK) };
    if (direction === "right") return { x: document.documentElement.clientWidth - PEEK - left, y: 0 };
    return { x: PEEK - right, y: 0 };
  }, []);

  const stow = useCallback((direction: Stow) => setStowed({ direction, ...measure(direction) }), [measure]);
  const recall = useCallback(() => setStowed(null), []);
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);
  const escape = useCallback(() => onEscapeRef.current?.(), []);
  const onArrowRef = useRef(onArrow);
  useEffect(() => {
    onArrowRef.current = onArrow;
  }, [onArrow]);

  // Returns true when the arrow did something (so the physical key's default scroll is prevented).
  const arrow = useCallback((key: string) => {
    const current = stowedRef.current;
    if (current) {
      if (key !== RECALL_KEY[current.direction]) return false;
      recall();
      return true;
    }
    if (onArrowRef.current?.(key)) return true;
    if (!STOW_KEY[key]) return false;
    stow(STOW_KEY[key]);
    return true;
  }, [recall, stow]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const current = stowedRef.current;
      if (event.key === "Escape") {
        if (current) recall();
        else escape();
        return;
      }
      if ((event.target as Element | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (event.key.startsWith("Arrow") && arrow(event.key)) event.preventDefault();
    };
    // Re-measure while stowed when the window or the laptop itself changes size (the lid closing
    // re-centres it), so the peeking edge stays in place.
    const onResize = () => setStowed((current) => (current ? { direction: current.direction, ...measure(current.direction) } : null));
    const observer = new ResizeObserver(onResize);
    if (rig.current) observer.observe(rig.current);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, escape, recall, arrow]);

  const panel = (direction: Stow, className: string, content: ReactNode) => (
    <div className={className} inert={stowed?.direction !== direction} data-shown={stowed?.direction === direction || undefined}>
      {content}
    </div>
  );

  return (
    <div className="keyboard-area">
      {panel("up", "rig-panel rig-panel-contact", contact)}
      {panel("right", "rig-panel rig-panel-projects", projects)}
      {panel("left", "rig-panel rig-panel-about", about)}
      <div ref={rig} className="keyboard-rig" data-stowed={stowed?.direction} style={stowed ? { transform: `translate(${stowed.x}px, ${stowed.y}px)` } : undefined}>
        <RigContext.Provider value={{ escape, arrow }}>
          <div inert={!!stowed}>{children}</div>
        </RigContext.Provider>
        <button type="button" className="keyboard-recall" onClick={recall} inert={!stowed}>
          <span aria-hidden="true">{stowed?.direction === "right" ? "◂" : stowed?.direction === "left" ? "▸" : "▾"}</span>
          <span className="sr-only"><Bi fr="Ressortir le portable" en="Bring the laptop back" /></span>
        </button>
      </div>
    </div>
  );
}

// For keys rendered inside the rig that need to slide it (e.g. ⌘ projets / ⌘ à propos).
export const useRig = () => useContext(RigContext);

export function EscKey({ className }: { className: string }) {
  const { escape } = useContext(RigContext);
  return (
    <button type="button" className={className} onClick={escape}>
      esc
    </button>
  );
}

export function ArrowKey({ className, arrowKey, label, children }: { className: string; arrowKey: string; label: ReactNode; children: ReactNode }) {
  const { arrow } = useContext(RigContext);
  return (
    <button type="button" className={className} onClick={() => arrow(arrowKey)}>
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
