import type { Metadata } from "next";
import { HomeKeyboard } from "@/components/home-keyboard";
import { Bi } from "@/components/i18n";
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
      <HomeKeyboard socials={socialKeys} egg={<EasterEgg />} />
    </main>
  );
}
