"use client";

import { useEffect, useRef, useState } from "react";
import { Bi } from "@/components/i18n";

// Background chiptune generated with the Web Audio API (no audio file), plus the key that mutes it.
// Browsers block sound until the visitor interacts, so the loop starts on the first click or key press
// anywhere on the page, unless the visitor muted it before (remembered in localStorage).

const BPM = 68;
const STEP = 60 / BPM / 4; // sixteenth note, in seconds
const VOLUME = 0.05;
// i–VI–III–VII in A minor, one bar each (MIDI notes).
const CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [48, 52, 55],
  [55, 59, 62],
];
const ARPEGGIO = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 2]; // index 3 = root an octave up

const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

function createEngine() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  master.gain.value = 0;
  master.connect(filter).connect(ctx.destination);

  const note = (midi: number, time: number, length: number, type: OscillatorType, level: number) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency(midi);
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(level, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(env).connect(master);
    osc.start(time);
    osc.stop(time + length + 0.02);
  };

  let step = 0;
  let nextTime = ctx.currentTime + 0.1;
  // Look-ahead scheduler: queue the notes of the next 100 ms every 25 ms.
  const timer = window.setInterval(() => {
    while (nextTime < ctx.currentTime + 0.1) {
      const chord = CHORDS[Math.floor(step / 16) % CHORDS.length];
      const i = ARPEGGIO[step % 16];
      note(i === 3 ? chord[0] + 12 : chord[i], nextTime, 0.18, "square", 0.5);
      if (step % 8 === 0) note(chord[0] - 12, nextTime, STEP * 7, "triangle", 1);
      step += 1;
      nextTime += STEP;
    }
  }, 25);

  return {
    fade(on: boolean) {
      if (on) void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(on ? VOLUME : 0, ctx.currentTime, 0.3);
    },
    close() {
      window.clearInterval(timer);
      void ctx.close();
    },
  };
}

export function MusicKey({ className }: { className: string }) {
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);
  // `playing` is what the visitor actually hears; it stays false until the first interaction.
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  const play = (on: boolean) => {
    playingRef.current = on;
    setPlaying(on);
    if (on) engine.current ??= createEngine();
    engine.current?.fade(on);
  };

  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("music"); } catch {}
    if (stored === "off") return;

    // First interaction anywhere starts the music, except a press on this key (it handles itself).
    const start = (event: Event) => {
      if ((event.target as Element | null)?.closest?.("[data-music-key]")) return;
      stop();
      if (!playingRef.current) play(true);
    };
    const stop = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return stop;
  }, []);

  useEffect(() => () => {
    engine.current?.close();
    engine.current = null;
  }, []);

  function toggle() {
    const next = !playingRef.current;
    try { window.localStorage.setItem("music", next ? "on" : "off"); } catch {}
    play(next);
  }

  return (
    <button type="button" className={className} onClick={toggle} data-music-key aria-pressed={!playing}>
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6h2.5l3.5-3v10l-3.5-3h-2.5z" fill="currentColor" />
        {playing ? <path d="M11 5.5c1.2 1.4 1.2 3.6 0 5M12.8 4c2 2.2 2 5.8 0 8" /> : <path d="M11 6l3.5 4M14.5 6l-3.5 4" />}
      </svg>
      <span className="sr-only">{playing ? <Bi fr="Couper la musique" en="Mute music" /> : <Bi fr="Activer la musique" en="Play music" />}</span>
    </button>
  );
}
