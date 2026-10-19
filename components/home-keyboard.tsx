"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Bi } from "@/components/i18n";
import { ArrowKey, EscKey, KeyboardRig, useRig } from "@/components/keyboard-rig";
import { PixelAvatar } from "@/components/pixel-avatar";
import { LanguageKey } from "@/components/language-key";
import { KeySoundKey } from "@/components/key-sound";
import { ThemeToggle } from "@/components/theme-toggle";

// Laptop of the /home test page. It arrives shut and opens itself to half-open (lid closed). A first
// click on a key opens the lid and previews the destination, a second click on the same key opens the link (⌘ projets / ⌘ à propos
// instead half-close the screen and slide the laptop to their panel, and the blog space bar opens
// /blog in a new tab). The return key (or the physical Enter key) opens the selection, or re-opens a
// shut laptop. esc closes the lid (clearing the selection); with nothing selected it shuts the laptop completely (a click on it opens it again).
// The ◂ / ▾ / ▸ arrow keys slide the laptop away to reveal projects / the contact form / about; ▴ on
// the half-open laptop opens the screen on the pixel avatar, and ▾ closes it again.

type Social = { id: string; href: string };
type Target = { id: string; href: string; internal: boolean };

const SOCIAL_NAMES: Record<string, string> = {
  instagram: "Instagram",
  github: "GitHub",
  "daily-dev": "daily.dev",
  linkedin: "LinkedIn",
  gmail: "Email",
  codingame: "CodinGame",
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
  cal: "cm", // renamed when the capture changed, so cached copies of the old one are not reused
  x: "x",
  promethee: "pm",
};

// Pause on the shut laptop before it opens by itself on arrival.
const INTRO_DELAY_MS = 500;

// Duration of the lid's open / close transition (.monitor-screen in globals.css).
const LID_MS = 600;

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

function Screen({ target, avatar }: { target: Target | null; avatar: boolean }) {
  if (avatar) {
    return (
      <div className="monitor-avatar">
        <PixelAvatar />
      </div>
    );
  }
  if (!target) return null;
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

// One triangle for the four arrow keys, rotated per direction (0 = up), so they all match.
function ArrowGlyph({ turn }: { turn: 0 | 90 | 180 | 270 }) {
  return (
    <svg className="key-arrow-glyph" viewBox="0 0 10 10" width="1em" height="1em" aria-hidden="true" style={{ transform: `rotate(${turn}deg)` }}>
      <path d="M5 2.5L8.5 7.5H1.5z" fill="currentColor" />
    </svg>
  );
}

// ⌘ projets / ⌘ à propos / contact: half-close the screen, then slide the laptop to reveal that panel
// (same as the ◂ / ▸ / ▾ arrows). With the screen open, the slide waits for the lid to close.
function PanelKey({ panel, settle, className, label, symbol = "⌘" }: { panel: "ArrowLeft" | "ArrowRight" | "ArrowDown"; settle: () => number; className: string; label: ReactNode; symbol?: ReactNode }) {
  const { arrow } = useRig();
  return (
    <button type="button" className={className} onClick={() => { const delay = settle(); window.setTimeout(() => arrow(panel), delay); }}>
      {symbol ? <span className="key-symbol" aria-hidden="true">{symbol}</span> : null}
      {label}
    </button>
  );
}

export function HomeKeyboard({ socials, contact, projects, about }: { socials: Social[]; contact: ReactNode; projects: ReactNode; about: ReactNode }) {
  const router = useRouter();
  const [target, setTarget] = useState<Target | null>(null);
  const [closed, setClosed] = useState(true);
  // Fully shut: the lid lies over the keyboard; a click on it (or Enter) opens the laptop again.
  // The page loads shut, then opens to half-open on its own (intro animation).
  const [shut, setShut] = useState(true);
  // Briefly true while re-opening, so the folded lid waits for the cover to fold back up.
  const [unshutting, setUnshutting] = useState(false);
  const unshutTimer = useRef(0);
  const unshut = useCallback(() => {
    setShut(false);
    setUnshutting(true);
    window.clearTimeout(unshutTimer.current);
    unshutTimer.current = window.setTimeout(() => setUnshutting(false), 650);
  }, []);
  useEffect(() => () => window.clearTimeout(unshutTimer.current), []);
  useEffect(() => {
    const intro = window.setTimeout(unshut, INTRO_DELAY_MS);
    return () => window.clearTimeout(intro);
  }, [unshut]);
  // ▴ on the half-open laptop opens the screen on the pixel avatar; ▾ closes it again.
  const [avatar, setAvatar] = useState(false);
  // What the screen shows. Only replaced when new content opens, so a closing lid keeps its last
  // content while it folds and fades instead of flashing an empty state.
  const [screen, setScreen] = useState<{ target: Target | null; avatar: boolean }>({ target: null, avatar: false });
  const avatarRef = useRef(false);
  useEffect(() => {
    avatarRef.current = avatar;
  }, [avatar]);
  const targetRef = useRef<Target | null>(null);
  const shutRef = useRef(true);
  useEffect(() => {
    shutRef.current = shut;
  }, [shut]);
  const closedRef = useRef(true);
  useEffect(() => {
    targetRef.current = target;
    closedRef.current = closed;
  }, [target, closed]);

  const enter = useCallback(() => {
    if (shutRef.current) unshut();
    else if (targetRef.current) open(targetRef.current, router);
  }, [router, unshut]);

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

  // esc closes an open lid (clearing the selection); with nothing selected it shuts the laptop.
  const onEscape = useCallback(() => {
    if (!closedRef.current) {
      setClosed(true);
      setTarget(null);
      setAvatar(false);
    } else if (!shutRef.current) setShut(true);
  }, []);

  // Back to the half-open laptop, without selection or avatar (used before sliding to a panel).
  // Returns how long to wait before sliding: the lid's closing time if the screen was open.
  const settle = useCallback(() => {
    const wasOpen = !closedRef.current;
    setClosed(true);
    setTarget(null);
    setAvatar(false);
    return wasOpen ? LID_MS : 0;
  }, []);

  // Arrows the laptop handles itself before KeyboardRig's slides.
  const onArrow = useCallback((key: string) => {
    // ▴ on the shut laptop opens it back to half-open (like a click on it or Enter).
    if (key === "ArrowUp" && shutRef.current) {
      unshut();
      return true;
    }
    if (key === "ArrowUp" && closedRef.current && !shutRef.current && !targetRef.current) {
      setAvatar(true);
      setScreen({ target: null, avatar: true });
      setClosed(false);
      return true;
    }
    if (key === "ArrowDown" && avatarRef.current && !closedRef.current) {
      setClosed(true);
      setAvatar(false);
      return true;
    }
    // A slide with the screen open first closes the lid, then slides once it is half-open.
    if ((key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowDown") && !closedRef.current) return settle();
    return false;
  }, [unshut, settle]);

  const select = (next: Target) => {
    if (!closedRef.current && targetRef.current?.id === next.id) return open(next, router);
    setTarget(next);
    setAvatar(false);
    setScreen({ target: next, avatar: false });
    setClosed(false);
  };

  const socialKey = (social: Social) => (
    <li key={social.id}>
      <button type="button" className={`key key-letter social-${social.id}`} aria-pressed={target?.id === social.id} aria-label={SOCIAL_NAMES[social.id] ?? social.id} onClick={() => select({ ...social, internal: false })}>
        <Image src={`/social/${social.id}.png`} alt="" width={22} height={22} />
      </button>
    </li>
  );


  return (
    <KeyboardRig contact={contact} projects={projects} about={about} onEscape={onEscape} onArrow={onArrow}>
      <div className="monitor" data-closed={closed || undefined} data-shut={shut || undefined} data-unshutting={unshutting || undefined} aria-live="polite">
        <div className="monitor-screen" aria-hidden={closed || undefined}>
          <Screen target={screen.target} avatar={screen.avatar} />
        </div>
        <div className="monitor-hinge" aria-hidden="true" />
      </div>
      <div className="laptop-base" data-shut={shut || undefined}>
        <nav className="keyboard" aria-labelledby="keyboard-label" inert={shut}>
          <span id="keyboard-label" className="sr-only"><Bi fr="Liens" en="Links" /></span>
          <div className="keyboard-top" aria-hidden="true">
            <span className="keyboard-brand">koddeur</span>
            <span className="keyboard-leds"><i /><i /><i /></span>
          </div>
          {/* Function row: esc closes the lid / shuts the laptop, F1 theme, F2 French, F3 English, F4 key sounds. */}
          <ul className="keyboard-row keyboard-fn">
            <li><EscKey className="key key-fn key-esc" /></li>
            <li><ThemeToggle className="key key-fn key-f1" /></li>
            <li><LanguageKey lang="fr" className="key key-fn key-f2 key-lang-fr" /></li>
            <li><LanguageKey lang="en" className="key key-fn key-f3 key-lang-en" /></li>
            <li><KeySoundKey className="key key-fn key-f4" /></li>
          </ul>
          {/* Social keys, five on the first row and four on the second after a wide contact key (like caps lock), with an ISO return key on the right. */}
          <ul className="keyboard-row keyboard-letters">
            <li className="key-return-slot">
              <button type="button" className="key key-return" onClick={enter}>
                {/* ISO-style inverted L: a wide top half over a narrower full-height stem. */}
                <span className="key-return-top" aria-hidden="true" />
                <span className="key-return-stem" aria-hidden="true" />
                {/* SVG rather than ↩, which iOS renders as an emoji. */}
                <svg className="key-symbol" viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 3.5v4a2 2 0 0 1-2 2H3.5M6 6.5l-3 3 3 3" />
                </svg>
                <Bi fr="entrée" en="return" />
              </button>
            </li>
            {socials.slice(0, 5).map(socialKey)}
            {/* Wide caps-lock-style key opening the second row: slides the laptop up to the contact form (like ▾). */}
            <li>
              <PanelKey
                panel="ArrowDown"
                settle={settle}
                className="key key-mod key-contact"
                label="contact"
                symbol={null}
              />
            </li>
            {socials.slice(5).map(socialKey)}
          </ul>
          {/* Bottom row: ⌘ keys and space bar, then the inverted-T arrow cluster. */}
          <ul className="keyboard-row keyboard-bottom">
            <li><PanelKey panel="ArrowLeft" settle={settle} className="key key-mod" label={PAGES.projects.label} /></li>
            <li className="key-space-slot">
              {/* The space bar opens the blog straight away in a new tab, without the screen preview. */}
              <Link href={PAGES.blog.href} className="key key-space" target="_blank" rel="noopener noreferrer">{PAGES.blog.label}</Link>
            </li>
            <li><PanelKey panel="ArrowRight" settle={settle} className="key key-mod" label={PAGES.about.label} /></li>
            {/* Arrow cluster, same as the physical arrows: ▴ shows the avatar on the half-open laptop,
                ◂ / ▸ slide the laptop to reveal projects / about, ▾ closes the avatar or reveals the contact form. */}
            <li className="key-arrows">
              <ArrowKey className="key key-arrow key-arrow-up" arrowKey="ArrowUp" label={<Bi fr="Afficher l'avatar" en="Show the avatar" />}><ArrowGlyph turn={0} /></ArrowKey>
              <ArrowKey className="key key-arrow" arrowKey="ArrowLeft" label={<Bi fr="Voir les projets" en="Show projects" />}><ArrowGlyph turn={270} /></ArrowKey>
              <ArrowKey className="key key-arrow" arrowKey="ArrowDown" label={<Bi fr="Me contacter" en="Contact me" />}><ArrowGlyph turn={180} /></ArrowKey>
              <ArrowKey className="key key-arrow" arrowKey="ArrowRight" label={<Bi fr="Voir à propos" en="Show about" />}><ArrowGlyph turn={90} /></ArrowKey>
            </li>
          </ul>
        </nav>
      {/* Back of the lid, folded over the keyboard when the laptop is shut. */}
      <button type="button" className="laptop-cover" onClick={unshut} inert={!shut}>
        <span className="laptop-cover-brand" aria-hidden="true">koddeur</span>
        <span className="sr-only"><Bi fr="Ouvrir le portable" en="Open the laptop" /></span>
      </button>
      </div>
    </KeyboardRig>
  );
}
