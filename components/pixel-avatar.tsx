"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/i18n";

// 64x64 pixel avatar typing on its laptop, whose pupils follow the pointer by whole pixels.
// Positions are in avatar pixels; each eye's black area leaves 2px of room around its pupil.
const GRID = 64;
const RANGE = 2;
const PUPILS = [
  { x: 24, y: 30 },
  { x: 38, y: 30 },
];

// Both pupils look from the point between the eyes, so they always move together.
const GAZE = { x: (PUPILS[0].x + PUPILS[1].x) / 2 + 1, y: PUPILS[0].y + 1.5 };

type Offset = { dx: number; dy: number };

export function PixelAvatar({ size = 256 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<Offset>({ dx: 0, dy: 0 });

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        const px = box.width / GRID;
        // Vector from between the eyes to the pointer, in avatar pixels.
        const vx = (event.clientX - (box.left + GAZE.x * px)) / px;
        const vy = (event.clientY - (box.top + GAZE.y * px)) / px;
        const distance = Math.hypot(vx, vy);
        if (distance < 1) return setOffset({ dx: 0, dy: 0 });
        // Full deflection once the pointer is ~40 avatar pixels away.
        const reach = Math.min(1, distance / 40) * RANGE;
        setOffset({ dx: Math.round((vx / distance) * reach), dy: Math.round((vy / distance) * reach) });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="pixel-avatar" style={{ width: size, height: size }}>
      {/* Sprite sheet: rest, left hand up, right hand up — cycled in CSS to look like typing. */}
      <div className="pixel-avatar-sprite" role="img" aria-labelledby="pixel-avatar-label" />
      <span id="pixel-avatar-label" className="sr-only"><Bi fr="Avatar de koddeur qui tape sur son ordinateur" en="koddeur's avatar typing on a laptop" /></span>
      {PUPILS.map((pupil) => (
        <span
          key={pupil.x}
          className="pixel-avatar-pupil"
          aria-hidden="true"
          style={{
            left: `${((pupil.x + offset.dx) / GRID) * 100}%`,
            top: `${((pupil.y + offset.dy) / GRID) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
