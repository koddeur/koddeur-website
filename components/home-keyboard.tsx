"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Bi } from "@/components/i18n";
import { EscKey, KeyboardRig } from "@/components/keyboard-rig";
import { LanguageKey } from "@/components/language-key";
import { MusicKey } from "@/components/music-key";
import { ThemeToggle } from "@/components/theme-toggle";

// Laptop of the /home test page. The lid starts closed; a first click on a key opens it and
// previews the destination, a second click on the same key opens the link. The return key (or the
// physical Enter key) opens the selection, or toggles the lid when nothing is selected. esc closes
// the lid (clearing the selection); with the lid already closed it slides the laptop away.

type Social = { id: string; href: string };
type Target = { id: string; href: string; internal: boolean };

const SOCIAL_NAMES: Record<string, string> = {
  instagram: "Instagram",
  github: "GitHub",
  "daily-dev": "daily.dev",
  linkedin: "LinkedIn",
  gmail: "Email",
  codingame: "CodinGame",
  bluesky: "Bluesky",
  cal: "Cal.com",
  x: "X",
  promethee: "Promethee",
};

const PAGES = {
  projects: { href: "/projects", label: <Bi fr="projets" en="projects" /> },
  blog: { href: "/blog", label: "blog" },
  about: { href: "/about", label: <Bi fr="à propos" en="about" /> },
};

// Socials with a captured screenshot in /public/previews/<id>.jpg (external sites refuse to be
// framed). The others fall back to a card with their icon, name and URL.
// LinkedIn, X and Gmail block logged-out headless captures: their previews are screenshots supplied by hand.
// File names are neutral on purpose: ad/tracker blockers drop URLs containing e.g. "linkedin".
const SOCIAL_PREVIEWS: Record<string, string> = {
  instagram: "ig",
  github: "gh",
  "daily-dev": "dd",
  linkedin: "li",
  gmail: "gm",
  codingame: "cg",
  bluesky: "bs",
  cal: "cal",
  x: "x",
  promethee: "pm",
};

// Width the internal pages are rendered at before being scaled down to the monitor.
const PREVIEW_WIDTH = 1280;

const displayUrl = (href: string) => href.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function open(target: Target, router: ReturnType<typeof useRouter>) {
  if (target.internal) router.push(target.href);
  else if (target.href.startsWith("mailto:")) window.location.href = target.href;
  else window.open(target.href, "_blank", "noopener,noreferrer");
}

function PagePreview({ href }: { href: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 0, height: 0 });

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const scale = entry.contentRect.width / PREVIEW_WIDTH;
      setBox({ scale, height: entry.contentRect.height / scale });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="monitor-page">
      {box.scale ? (
        <iframe
          key={href}
          src={href}
          title={href}
          tabIndex={-1}
          aria-hidden="true"
          style={{ width: PREVIEW_WIDTH, height: box.height, transform: `scale(${box.scale})` }}
        />
      ) : null}
    </div>
  );
}

function Screen({ target }: { target: Target | null }) {
  if (!target) {
    return (
      <div className="monitor-idle">
        <p className="egg-prompt">&gt; koddeur</p>
        <p><Bi fr="Choisis une touche, puis appuie sur entrée." en="Pick a key, then press return." /><span className="egg-cursor" aria-hidden="true" /></p>
      </div>
    );
  }
  if (target.internal) return <PagePreview href={target.href} />;
  const preview = SOCIAL_PREVIEWS[target.id];
  if (preview) {
    // keyed by id so switching keys swaps the image at once instead of keeping the old one while loading
    return <Image key={target.id} className="monitor-shot" src={`/previews/${preview}.jpg`} alt="" fill sizes="560px" loading="eager" />;
  }
  return (
    <div className={`monitor-social social-${target.id}`}>
      <Image src={`/social/${target.id}.png`} alt="" width={56} height={56} />
      <p className="monitor-social-name">{SOCIAL_NAMES[target.id] ?? target.id}</p>
      <p className="monitor-social-url">{displayUrl(target.href)}</p>
    </div>
  );
}

export function HomeKeyboard({ socials, egg }: { socials: Social[]; egg: ReactNode }) {
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [closed, setClosed] = useState(true);
  const targetRef = useRef<Target | null>(null);
  const closedRef = useRef(true);
  useEffect(() => {
    targetRef.current = target;
    closedRef.current = closed;
  }, [target, closed]);

  const enter = useCallback(() => {
    if (targetRef.current) open(targetRef.current, router);
    else setClosed((current) => !current);
  }, [router]);

  // Physical Enter behaves like the return key. A focused on-screen key (left focused by a click)
  // must not swallow it; other focused controls keep their native Enter.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const focused = event.target as Element | null;
      if (focused?.closest?.(".key-return")) return; // its own click handler runs
      if (focused?.closest?.(".keyboard .key")) event.preventDefault();
      else if (focused?.closest?.("a, button, input, textarea, select, [contenteditable]")) return;
      enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter]);

  // esc closes an open lid; with the lid already closed, KeyboardRig slides the laptop away.
  const onEscape = useCallback(() => {
    if (closedRef.current) return false;
    setClosed(true);
    setTarget(null);
    return true;
  }, []);

  const select = (next: Target) => {
    if (!closedRef.current && targetRef.current?.id === next.id) return open(next, router);
    setTarget(next);
    setClosed(false);
  };

  const pageKey = (id: keyof typeof PAGES, className: string, symbol: boolean) => (
    <button type="button" className={className} aria-pressed={target?.id === id} onClick={() => select({ id, href: PAGES[id].href, internal: true })}>
      {symbol ? <span className="key-symbol" aria-hidden="true">⌘</span> : null}
      {PAGES[id].label}
    </button>
  );

  return (
    <KeyboardRig egg={egg} onEscape={onEscape}>
      <div className="monitor" data-closed={closed || undefined} aria-live="polite">
        <div className="monitor-screen">
          <Screen target={target} />
        </div>
        <div className="monitor-hinge" aria-hidden="true" />
      </div>
      <nav className="keyboard" aria-labelledby="keyboard-label">
        <span id="keyboard-label" className="sr-only"><Bi fr="Liens" en="Links" /></span>
        <div className="keyboard-top" aria-hidden="true">
          <span className="keyboard-brand">koddeur</span>
          <span className="keyboard-leds"><i /><i /><i /></span>
        </div>
        {/* Function row: esc closes the lid / puts the laptop away, F1 theme, F2 French, F3 English, F4 music. */}
        <ul className="keyboard-row keyboard-fn">
          <li><EscKey className="key key-fn key-esc" /></li>
          <li><ThemeToggle className="key key-fn key-f1" /></li>
          <li><LanguageKey lang="fr" className="key key-fn key-f2 key-lang-fr" /></li>
          <li><LanguageKey lang="en" className="key key-fn key-f3 key-lang-en" /></li>
          <li><MusicKey className="key key-fn key-f4" /></li>
        </ul>
        {/* Social keys, two rows of five, with a two-row return key on the right. */}
        <ul className="keyboard-row keyboard-letters">
          <li className="key-return-slot">
            <button type="button" className="key key-return" onClick={enter}>
              <span className="key-symbol" aria-hidden="true">↩</span>
              <Bi fr="entrée" en="return" />
            </button>
          </li>
          {socials.map((social) => (
            <li key={social.id}>
              <button type="button" className={`key key-letter social-${social.id}`} aria-pressed={target?.id === social.id} aria-label={SOCIAL_NAMES[social.id] ?? social.id} onClick={() => select({ ...social, internal: false })}>
                <Image src={`/social/${social.id}.png`} alt="" width={22} height={22} />
              </button>
            </li>
          ))}
        </ul>
        {/* Bottom row: ⌘ keys and space bar, with a decorative inverted-T arrow cluster. */}
        <ul className="keyboard-row keyboard-bottom">
          <li>{pageKey("projects", "key key-mod", true)}</li>
          <li className="key-space-slot">{pageKey("blog", "key key-space", false)}</li>
          <li>{pageKey("about", "key key-mod", true)}</li>
          <li className="key-arrows" aria-hidden="true">
            <span className="key key-arrow key-arrow-up">▴</span>
            <span className="key key-arrow">◂</span>
            <span className="key key-arrow">▾</span>
            <span className="key key-arrow">▸</span>
          </li>
        </ul>
      </nav>
    </KeyboardRig>
  );
}
