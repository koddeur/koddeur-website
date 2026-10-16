import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PixelAvatar } from "@/components/pixel-avatar";
import { Bi } from "@/components/i18n";
import { EscKey, KeyboardRig } from "@/components/keyboard-rig";
import { LanguageKey } from "@/components/language-key";
import { MusicKey } from "@/components/music-key";
import { ThemeToggle } from "@/components/theme-toggle";
import { socials } from "@/lib/site";

// Test page for the future home page.
export const metadata: Metadata = {
  title: "koddeur",
  robots: { index: false },
};

// Promethee only lives on the keyboard for now: the current home page grid is a 3x3 of `socials`.
const socialKeys = [...socials, { id: "promethee", href: "https://www.promethee.io/koddeur" }];

// Hidden behind the keyboard, revealed by the esc key.
function EasterEgg() {
  return (
    <div className="egg-terminal">
      <p className="egg-prompt">&gt; cat secret.txt</p>
      <p><Bi fr="Bravo, tu as trouvé le passage secret." en="Well done, you found the secret passage." /></p>
      <p className="egg-hint"><Bi fr="Clique sur ▾ en haut pour ramener le clavier." en="Click ▾ at the top to bring the keyboard back." /><span className="egg-cursor" aria-hidden="true" /></p>
    </div>
  );
}

export default function HomeTest() {
  return (
    <main className="shell home-test">
      <KeyboardRig egg={<EasterEgg />}>
        <nav className="keyboard" aria-labelledby="keyboard-label">
          <span id="keyboard-label" className="sr-only"><Bi fr="Liens" en="Links" /></span>
          <div className="keyboard-top" aria-hidden="true">
            <span className="keyboard-brand">koddeur</span>
            <span className="keyboard-leds"><i /><i /><i /></span>
          </div>
          {/* Function row: esc puts the keyboard away, F1 theme, F2 French, F3 English, F4 music. */}
          <ul className="keyboard-row keyboard-fn">
            <li><EscKey className="key key-fn key-esc" /></li>
            <li><ThemeToggle className="key key-fn key-f1" /></li>
            <li><LanguageKey lang="fr" className="key key-fn key-f2 key-lang-fr" /></li>
            <li><LanguageKey lang="en" className="key key-fn key-f3 key-lang-en" /></li>
            <li><MusicKey className="key key-fn key-f4" /></li>
          </ul>
          {/* Social links as regular keys, two rows of five. */}
          <ul className="keyboard-row keyboard-letters">
            {socialKeys.map((social) => {
              const external = !social.href.startsWith("mailto:");
              return (
                <li key={social.id}>
                  <a href={social.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={`key key-letter social-${social.id}`} aria-label={social.id}>
                    <Image src={`/social/${social.id}.png`} alt="" width={22} height={22} />
                  </a>
                </li>
              );
            })}
          </ul>
          {/* Bottom row: ⌘ keys and space bar, with a decorative inverted-T arrow cluster. */}
          <ul className="keyboard-row keyboard-bottom">
            <li><Link href="/projects" className="key key-mod"><span className="key-symbol" aria-hidden="true">⌘</span><Bi fr="projets" en="projects" /></Link></li>
            <li className="key-space-slot"><Link href="/blog" className="key key-space">blog</Link></li>
            <li><Link href="/about" className="key key-mod"><span className="key-symbol" aria-hidden="true">⌘</span><Bi fr="à propos" en="about" /></Link></li>
            <li className="key-arrows" aria-hidden="true">
              <span className="key key-arrow key-arrow-up">▴</span>
              <span className="key key-arrow">◂</span>
              <span className="key key-arrow">▾</span>
              <span className="key key-arrow">▸</span>
            </li>
          </ul>
        </nav>
      </KeyboardRig>
      <PixelAvatar />
    </main>
  );
}
