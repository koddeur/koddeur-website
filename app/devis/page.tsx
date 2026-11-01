import type { Metadata } from "next";
import Link from "next/link";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { AdminLink } from "@/components/admin-link";
import { Logo } from "@/components/logo";
import { QuoteForm } from "@/components/quote-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "Pré-devis", description: "Décris ton projet de site, d'app ou d'automatisation pour recevoir un devis chiffré." };

export default function QuotePage() {
  return (
    <main className="shell glass-ui">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><AdminLink /><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title"><Bi fr="Pré-devis" en="Get a quote" /></h1>
        <p><Bi fr="Site, app ou automatisation : quelques questions pour comprendre ton projet, puis je t'envoie un devis chiffré." en="Website, app or automation: a few questions to understand your project, then I send you a priced quote." /></p>
      </header>

      <div className="quote-page"><QuoteForm /></div>

      <footer>
        <span>© {new Date().getFullYear()} koddeur</span>
        <nav className="footer-links">
          <Link href="/"><Bi fr="Accueil" en="Home" /></Link>
          <Link href="/blog">Blog</Link>
          <Link href="/projects"><Bi fr="Projets" en="Projects" /></Link>
          <Link href="/about">About</Link>
          <Link href="/devis"><Bi fr="Devis" en="Quote" /></Link>
        </nav>
      </footer>
    </main>
  );
}
