import { formatDate } from "@/lib/format";
import { Bi } from "@/components/i18n";
import type { Project } from "@/lib/projects";
import { ProjectThumb } from "@/components/project-thumb";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="project-card-main">
        <div className="article-meta">
          <time>{formatDate(project.date)}</time>
          <span className={`status-badge status-${project.status}`}>
            {project.status === "closed" ? <Bi fr="Hors-ligne" en="Offline" /> : <Bi fr="En ligne" en="Online" />}
          </span>
        </div>
        <h2><Bi fr={project.name} en={project.en?.name ?? project.name} /></h2>
        <p><Bi fr={project.description} en={project.en?.description ?? project.description} /></p>
        {project.link || project.githubUrl ? (
          <div className="project-links">
            {project.link ? (
              <a href={project.link} target="_blank" rel="noreferrer" className="read-link" aria-label={`${project.name} — link`}>
                <Bi fr="visiter" en="visit" /> <span className="arrow">↗</span>
              </a>
            ) : null}
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="read-link" aria-label={`GitHub — ${project.name}`}>
                github <span className="arrow">↗</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      {project.image ? <ProjectThumb image={project.image} alt={project.name} /> : null}
    </article>
  );
}
