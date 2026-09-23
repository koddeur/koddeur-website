import Link from "next/link";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { ProjectCard } from "@/components/project-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <main className="shell">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title"><Bi fr="Projets" en="Projects" /></h1>
      </header>
      <section className="feed" aria-labelledby="projects-title">
        <div className="section-heading"><h2 id="projects-title"><Bi fr="Projets" en="Projects" /></h2><span className="count">{String(projects.length).padStart(2, "0")} <Bi fr="projets" en="projects" /></span></div>
        {projects.length ? projects.map((project) => <ProjectCard project={project} key={project.slug} />) : (
          <div className="empty">
            <span>∅</span>
            <p><Bi fr="Aucun projet publié pour le moment." en="No projects published yet." /></p>
          </div>
        )}
      </section>
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
