import { Bi } from "@/components/i18n";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/projects";

// Projects list, shared by /projects and the /home laptop's left panel.
export function ProjectsContent({ projects }: { projects: Project[] }) {
  return (
    <section className="feed" aria-labelledby="projects-title">
      <div className="section-heading"><h2 id="projects-title"><Bi fr="Projets" en="Projects" /></h2><span className="count">{String(projects.length).padStart(2, "0")} <Bi fr="projets" en="projects" /></span></div>
      {projects.length ? projects.map((project) => <ProjectCard project={project} key={project.slug} />) : (
        <div className="empty">
          <span>∅</span>
          <p><Bi fr="Aucun projet publié pour le moment." en="No projects published yet." /></p>
        </div>
      )}
    </section>
  );
}
