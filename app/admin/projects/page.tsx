import Link from "next/link";
import { AdminSectionSwitch } from "@/components/admin-section-switch";
import { ProjectForm } from "@/components/project-form";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjects();
  return <main className="shell admin-shell monochrome glass-ui">
    <header className="article-nav">
      <Logo href="/" mark={false} />
      <div className="admin-nav-actions">
        <LogoutButton />
        <ThemeToggle />
      </div>
    </header>
    <AdminSectionSwitch active="projects" />
    <section className="admin-heading"><span className="eyebrow">admin / projets</span><h1>Mes projets</h1><p><Link href="/projects" className="preview-link">Voir les projets ↗</Link></p></section>
    <ProjectForm projects={projects} />
  </main>;
}
