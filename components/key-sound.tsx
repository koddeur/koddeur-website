"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/i18n";

// Keyboard click sounds for the /home laptop, synthesised with the Web Audio API (no audio file):
// a soft, muted tap in the spirit of a Mac keyboard (low-travel scissor keys): a very short low-passed
// noise burst for the keycap plus a faint low body, slightly randomised so repeated presses don't sound
// mechanical, and a bit deeper for the wide keys. The F4 key mutes / unmutes them (remembered in
// localStorage). Sounds only ever start from a press, so no autoplay restriction applies.

const KEYS = ".keyboard .key, .laptop-cover";
const WIDE = ".key-space, .key-return, .key-mod, .laptop-cover";

let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function click(wide: boolean) {
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  const ctx = audio;
  if (!noise) {
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const now = ctx.currentTime;
  const jitter = 0.85 + Math.random() * 0.3;

  // Keycap "tap": noise kept in the low-mids (no bright click), very short decay.
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 500;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = (wide ? 1500 : 2200) * jitter;
  low.Q.value = 0.7;
  const tap = ctx.createGain();
  tap.gain.setValueAtTime(0.0001, now);
  tap.gain.linearRampToValueAtTime(wide ? 0.15 : 0.12, now + 0.002);
  tap.gain.exponentialRampToValueAtTime(0.0001, now + (wide ? 0.03 : 0.02));
  source.connect(high).connect(low).connect(tap).connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.04);

  // Faint body: a short falling sine, just enough to give the tap some weight.
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime((wide ? 220 : 300) * jitter, now);
  osc.frequency.exponentialRampToValueAtTime(wide ? 130 : 180, now + 0.03);
  const body = ctx.createGain();
  body.gain.setValueAtTime(0.0001, now);
  body.gain.linearRampToValueAtTime(wide ? 0.08 : 0.06, now + 0.002);
  body.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  osc.connect(body).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

export function KeySoundKey({ className }: { className: string }) {
  const [on, setOn] = useState(true);
  const onRef = useRef(true);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("keysound"); } catch {}
    onRef.current = stored !== "off";
    setOn(onRef.current);

    const play = (target: EventTarget | null) => {
      const key = (target as Element | null)?.closest?.(KEYS);
      if (!key || !onRef.current) return;
      click(!!key.closest(WIDE));
    };
    // Mouse / touch presses sound on pointerdown (snappier than click); keyboard activation of a
    // focused key (Enter / Space) arrives as a click with detail 0.
    const onPointerDown = (event: PointerEvent) => play(event.target);
    const onClick = (event: MouseEvent) => {
      if (event.detail === 0) play(event.target);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  function toggle() {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    try { window.localStorage.setItem("keysound", next ? "on" : "off"); } catch {}
  }

  return (
    <button type="button" className={className} onClick={toggle} aria-pressed={!on}>
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6h2.5l3.5-3v10l-3.5-3h-2.5z" fill="currentColor" />
        {on ? <path d="M11 5.5c1.2 1.4 1.2 3.6 0 5M12.8 4c2 2.2 2 5.8 0 8" /> : <path d="M11 6l3.5 4M14.5 6l-3.5 4" />}
      </svg>
      <span className="sr-only">{on ? <Bi fr="Couper le son des touches" en="Mute key sounds" /> : <Bi fr="Activer le son des touches" en="Unmute key sounds" />}</span>
    </button>
  );
}
