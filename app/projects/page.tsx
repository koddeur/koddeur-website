import Link from "next/link";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { AdminLink } from "@/components/admin-link";
import { Logo } from "@/components/logo";
import { ProjectsContent } from "@/components/projects-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <main className="shell">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><AdminLink /><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title"><Bi fr="Projets" en="Projects" /></h1>
      </header>
      <ProjectsContent projects={projects} />
      <footer>
        <span>© {new Date().getFullYear()} koddeur</span>
        <nav className="footer-links">
          <Link href="/"><Bi fr="Accueil" en="Home" /></Link>
          <Link href="/blog">Blog</Link>
          <Link href="/projects"><Bi fr="Projets" en="Projects" /></Link>
          <Link href="/about">About</Link>
        </nav>
      </footer>
    </main>
  );
}
