"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectStatus } from "@/lib/projects";

const limits = { name: 60, description: 250, image: 500, githubUrl: 300, link: 300 };

const statusLabels: Record<ProjectStatus, string> = {
  online: "En ligne",
  closed: "Hors-ligne",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectForm({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const latestProject = projects[0] ?? null;
  const [editingSlug, setEditingSlug] = useState<string | null>(latestProject?.slug ?? null);
  const [name, setName] = useState(latestProject?.name ?? "");
  const [date, setDate] = useState(latestProject ? latestProject.date.slice(0, 10) : today);
  const [image, setImage] = useState(latestProject?.image ?? "");
  const [description, setDescription] = useState(latestProject?.description ?? "");
  const [githubUrl, setGithubUrl] = useState(latestProject?.githubUrl ?? "");
  const [link, setLink] = useState(latestProject?.link ?? "");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(latestProject?.status ?? "online");
  const [formStatus, setFormStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingProject = projects.find((project) => project.slug === editingSlug);

  function startEditing(project: Project) {
    setEditingSlug(project.slug);
    setName(project.name);
    setDate(project.date.slice(0, 10));
    setImage(project.image);
    setDescription(project.description);
    setGithubUrl(project.githubUrl);
    setLink(project.link);
    setProjectStatus(project.status);
    setFormStatus(null);
  }

  function resetEditor() {
    setEditingSlug(null);
    setName(""); setDate(today()); setImage(""); setDescription(""); setGithubUrl(""); setLink(""); setProjectStatus("online"); setFormStatus(null);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true); setFormStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setImage(result.url);
    } catch (error) {
      setFormStatus({ type: "error", message: error instanceof Error ? error.message : "Impossible d'envoyer l'image." });
    } finally { setUploading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormStatus(null); setLoading(true);
    if (Number.isNaN(new Date(date).getTime())) {
      setFormStatus({ type: "error", message: "La date n'est pas valide." }); setLoading(false); return;
    }
    try {
      const response = await fetch(editingSlug ? `/api/projects/${editingSlug}` : "/api/projects", { method: editingSlug ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, date, image, description, githubUrl, link, status: projectStatus }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const wasNew = !editingSlug;
      if (wasNew) setEditingSlug(result.slug);
      setFormStatus({ type: "success", message: wasNew ? "Projet publié." : "Projet mis à jour." });
      router.refresh();
    } catch (error) { setFormStatus({ type: "error", message: error instanceof Error ? error.message : "Une erreur est survenue." }); }
    finally { setLoading(false); }
  }

  return <div className="admin-editor">
    <aside className="article-index" aria-label="Projets disponibles">
      <button type="button" className={!editingSlug ? "article-index-new active" : "article-index-new"} onClick={resetEditor}>+ Nouveau projet</button>
      <div className="article-index-heading"><span>projets détectés</span><strong>{String(projects.length).padStart(2, "0")}</strong></div>
      <p>Ajoutez directement un <code>.md</code> dans <code>content/projects</code> : il apparaîtra ici après rechargement.</p>
      <div className="article-index-list">
        {projects.map((project) => <button type="button" key={project.slug} className={editingSlug === project.slug ? "article-choice active" : "article-choice"} onClick={() => startEditing(project)}>
          <span>{project.name}</span><small>{project.date.slice(0, 10).replaceAll("-", "/")}</small>
        </button>)}
      </div>
    </aside>
    <form className="article-form" onSubmit={submit}>
      <div className="editor-heading">
        <span className="eyebrow">{editingProject ? `édition / ${editingProject.slug}.md` : "nouveau projet"}</span>
        <div className="editor-actions">
          {editingProject?.githubUrl ? <a href={editingProject.githubUrl} target="_blank" rel="noreferrer" className="preview-link">Voir sur GitHub ↗</a> : null}
        </div>
      </div>
      <div className="field"><label htmlFor="name">Nom <span>{name.length}/{limits.name}</span></label><input id="name" value={name} maxLength={limits.name} onChange={(event) => setName(event.target.value)} placeholder="Nom du projet" required /></div>
      <div className="field"><label htmlFor="description">Description <span>{description.length}/{limits.description}</span></label><textarea id="description" value={description} maxLength={limits.description} onChange={(event) => setDescription(event.target.value)} placeholder="Une toute petite description." rows={2} required /></div>
      <div className="field">
        <label htmlFor="image">Image <span>{uploading ? "envoi..." : "URL ou upload"}</span></label>
        <div className="image-field">
          {image ? <img src={image} alt="" className="image-preview" /> : null}
          <input id="image" type="text" value={image} maxLength={limits.image} onChange={(event) => setImage(event.target.value)} placeholder="https://…/image.png" />
          <button type="button" className="reset-button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? "envoi..." : "↑ importer une image"}</button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </div>
      </div>
      <div className="field"><label htmlFor="link">Lien du projet <span>facultatif</span></label><input id="link" type="url" value={link} maxLength={limits.link} onChange={(event) => setLink(event.target.value)} placeholder="https://mon-projet.com" /></div>
      <div className="field"><label htmlFor="githubUrl">Lien GitHub <span>facultatif</span></label><input id="githubUrl" type="url" value={githubUrl} maxLength={limits.githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/…" /></div>
      <div className="field"><label htmlFor="status">Statut</label>
        <select id="status" value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as ProjectStatus)}>
          {(Object.keys(statusLabels) as ProjectStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="date">Date</label><input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
      {formStatus && <p className={`form-status ${formStatus.type}`} role="status">{formStatus.message}</p>}
      <button type="submit" disabled={loading}>{loading ? "enregistrement..." : editingProject ? "Enregistrer les modifications →" : "Publier le projet →"}</button>
    </form>
  </div>;
}
