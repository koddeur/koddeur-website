"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/articles";

const limits = { title: 50, description: 300, content: 10000, keywords: 30 };

type EditableArticle = Pick<Article, "slug" | "title" | "description" | "content" | "keywords" | "createdAt" | "published" | "en">;

function unquoteValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

const looseFieldKeys = ["title", "description", "createdat", "keywords", "status", "published"];

// Notion exports skip the `---` frontmatter block: a leading "# Title" heading followed by
// loose "key: value" property lines (no delimiters), then a blank line, then the body.
function parseLooseMarkdownFile(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let index = 0;
  while (index < lines.length && lines[index].trim() === "") index++;

  let headingTitle = "";
  if (lines[index]?.startsWith("# ")) {
    headingTitle = lines[index].slice(2).trim();
    index++;
    while (index < lines.length && lines[index].trim() === "") index++;
  }

  const fields: Record<string, string> = {};
  while (index < lines.length && lines[index].trim() !== "") {
    const line = lines[index];
    const colonIndex = line.indexOf(":");
    const key = colonIndex > -1 ? line.slice(0, colonIndex).trim().toLowerCase() : "";
    if (!looseFieldKeys.includes(key)) break;
    fields[key] = line.slice(colonIndex + 1).trim();
    index++;
  }
  while (index < lines.length && lines[index].trim() === "") index++;

  if (!headingTitle && Object.keys(fields).length === 0) {
    return { title: "", description: "", keywords: "", createdAt: "", published: true, content: source.trim() };
  }

  const keywords = fields.keywords ? fields.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean).join(", ") : "";
  const createdAtDate = fields.createdat ? new Date(fields.createdat) : null;

  return {
    title: fields.title || headingTitle,
    description: fields.description || "",
    keywords,
    createdAt: createdAtDate && !Number.isNaN(createdAtDate.getTime()) ? createdAtDate.toISOString() : "",
    published: true,
    content: lines.slice(index).join("\n").trim(),
  };
}

function parseMarkdownFile(source: string) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return parseLooseMarkdownFile(source);
  const fields = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const index = line.indexOf(":");
      return index > -1 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );
  const keywords = fields.keywords
    ? unquoteValue(fields.keywords).replace(/^\[|\]$/g, "").split(",").map(unquoteValue).filter(Boolean).join(", ")
    : "";
  return {
    title: fields.title ? unquoteValue(fields.title) : "",
    description: fields.description ? unquoteValue(fields.description) : "",
    keywords,
    createdAt: fields.createdAt ? unquoteValue(fields.createdAt) : "",
    published: fields.published ? unquoteValue(fields.published) !== "false" : true,
    content: match[2].trim(),
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ArticleForm({ articles }: { articles: EditableArticle[] }) {
  const router = useRouter();
  const latestArticle = articles[0] ?? null;
  const [editingSlug, setEditingSlug] = useState<string | null>(latestArticle?.slug ?? null);
  const [slug, setSlug] = useState(latestArticle?.slug ?? "");
  const [title, setTitle] = useState(latestArticle?.title ?? "");
  const [description, setDescription] = useState(latestArticle?.description ?? "");
  const [keywords, setKeywords] = useState(latestArticle?.keywords.join(", ") ?? "");
  const [content, setContent] = useState(latestArticle?.content ?? "");
  const [titleEn, setTitleEn] = useState(latestArticle?.en?.title ?? "");
  const [descriptionEn, setDescriptionEn] = useState(latestArticle?.en?.description ?? "");
  const [contentEn, setContentEn] = useState(latestArticle?.en?.content ?? "");
  const [createdAt, setCreatedAt] = useState(latestArticle ? latestArticle.createdAt.slice(0, 10) : today);
  const [published, setPublished] = useState(latestArticle?.published ?? true);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const editingArticle = articles.find((article) => article.slug === editingSlug);

  function startEditing(article: EditableArticle) {
    setEditingSlug(article.slug);
    setSlug(article.slug);
    setTitle(article.title);
    setDescription(article.description);
    setKeywords(article.keywords.join(", "));
    setContent(article.content);
    setTitleEn(article.en?.title ?? "");
    setDescriptionEn(article.en?.description ?? "");
    setContentEn(article.en?.content ?? "");
    setCreatedAt(article.createdAt.slice(0, 10));
    setPublished(article.published);
    setStatus(null);
  }

  function resetEditor() {
    setEditingSlug(null);
    setSlug(""); setTitle(""); setDescription(""); setKeywords(""); setContent(""); setTitleEn(""); setDescriptionEn(""); setContentEn(""); setCreatedAt(today()); setPublished(true); setStatus(null);
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Échec de l'envoi de « ${file.name} ».`);
    return result.url as string;
  }

  function relativePathInSelection(file: File) {
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    if (!path) return file.name;
    const segments = path.split("/");
    return segments.slice(1).join("/") || file.name;
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const markdownFiles = files.filter((file) => file.name.toLowerCase().endsWith(".md"));
    if (markdownFiles.length !== 1) {
      setStatus({
        type: "error",
        message: markdownFiles.length === 0
          ? "Aucun fichier .md trouvé dans la sélection."
          : "Plusieurs fichiers .md trouvés : sélectionnez le dossier d'un seul article à la fois.",
      });
      return;
    }
    const markdownFile = markdownFiles[0];
    const imageFiles = files.filter((file) => file !== markdownFile);

    const markdownRelativePath = relativePathInSelection(markdownFile);
    const markdownDir = markdownRelativePath.includes("/") ? markdownRelativePath.slice(0, markdownRelativePath.lastIndexOf("/")) : "";

    const byPath = new Map<string, File>();
    const byBasename = new Map<string, File>();
    for (const file of imageFiles) {
      const relativePath = relativePathInSelection(file);
      const pathFromMarkdown = markdownDir && relativePath.startsWith(`${markdownDir}/`) ? relativePath.slice(markdownDir.length + 1) : relativePath;
      byPath.set(pathFromMarkdown, file);
      byBasename.set(file.name.toLowerCase(), file);
    }

    setImporting(true); setStatus(null);
    try {
      const parsed = parseMarkdownFile(await markdownFile.text());
      let content = parsed.content.slice(0, limits.content);

      const referencedPaths = Array.from(content.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g), (match) => match[1]);
      const localPaths = [...new Set(referencedPaths.filter((path) => !/^([a-z]+:)?\/\//i.test(path) && !path.startsWith("/") && !path.startsWith("data:")))];

      const unmatched: string[] = [];
      let uploadedCount = 0;
      for (const path of localPaths) {
        let decodedPath = path;
        try { decodedPath = decodeURIComponent(path); } catch { /* keep raw path if it isn't validly encoded */ }
        const basename = decodedPath.split("/").pop() ?? decodedPath;
        const match = byPath.get(decodedPath) ?? byBasename.get(basename.toLowerCase());
        if (!match) { unmatched.push(basename); continue; }
        const url = await uploadImage(match);
        content = content.split(path).join(url);
        uploadedCount += 1;
      }

      setEditingSlug(null);
      setSlug("");
      setTitle((parsed.title || markdownFile.name.replace(/\.md$/i, "")).slice(0, limits.title));
      setDescription(parsed.description.slice(0, limits.description));
      setKeywords(parsed.keywords);
      setContent(content);
      setTitleEn(""); setDescriptionEn(""); setContentEn("");
      const parsedDate = parsed.createdAt && !Number.isNaN(new Date(parsed.createdAt).getTime()) ? parsed.createdAt.slice(0, 10) : today();
      setCreatedAt(parsedDate);
      setPublished(parsed.published);

      const messageParts = [`Fichier « ${markdownFile.name} » importé.`];
      if (uploadedCount) messageParts.push(`${uploadedCount} image${uploadedCount > 1 ? "s" : ""} importée${uploadedCount > 1 ? "s" : ""}.`);
      if (unmatched.length) messageParts.push(`Image${unmatched.length > 1 ? "s" : ""} introuvable${unmatched.length > 1 ? "s" : ""} parmi les fichiers sélectionnés : ${unmatched.join(", ")}.`);
      messageParts.push("Vérifiez les champs puis publiez.");
      setStatus({ type: unmatched.length ? "error" : "success", message: messageParts.join(" ") });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Impossible d'importer le fichier." });
    } finally { setImporting(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus(null); setLoading(true);
    const parsedKeywords = keywords.split(",").map((item) => item.trim()).filter(Boolean);
    if (parsedKeywords.some((item) => item.length > limits.keywords)) {
      setStatus({ type: "error", message: "Chaque mot-clé est limité à 30 caractères." }); setLoading(false); return;
    }
    if (Number.isNaN(new Date(createdAt).getTime())) {
      setStatus({ type: "error", message: "La date de création n'est pas valide." }); setLoading(false); return;
    }
    try {
      const response = await fetch(editingSlug ? `/api/articles/${editingSlug}` : "/api/articles", { method: editingSlug ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, content, keywords: parsedKeywords, createdAt, published, slug: editingSlug ? slug : undefined, titleEn, descriptionEn, contentEn }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const wasNew = !editingSlug;
      const renamed = !wasNew && result.slug !== editingSlug;
      setEditingSlug(result.slug);
      setSlug(result.slug);
      setStatus({
        type: "success",
        message: wasNew
          ? "Article publié. Le fichier Markdown a été créé."
          : renamed
            ? `Article mis à jour et déplacé vers /articles/${result.slug}.`
            : "Article mis à jour dans son fichier Markdown.",
      });
      router.refresh();
    } catch (error) { setStatus({ type: "error", message: error instanceof Error ? error.message : "Une erreur est survenue." }); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!editingArticle) return;
    if (!window.confirm(`Supprimer définitivement « ${editingArticle.title} » ? Cette action est irréversible.`)) return;
    setDeleting(true); setStatus(null);
    try {
      const response = await fetch(`/api/articles/${editingArticle.slug}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      resetEditor();
      setStatus({ type: "success", message: "Article supprimé." });
      router.refresh();
    } catch (error) { setStatus({ type: "error", message: error instanceof Error ? error.message : "Impossible de supprimer l'article." }); }
    finally { setDeleting(false); }
  }

  return <div className="admin-editor">
    <aside className="article-index" aria-label="Articles disponibles">
      <button type="button" className={!editingSlug ? "article-index-new active" : "article-index-new"} onClick={resetEditor}>+ Nouvel article</button>
      <div className="article-index-heading"><span>fichiers détectés</span><strong>{String(articles.length).padStart(2, "0")}</strong></div>
      <p>Ajoutez directement un <code>.md</code> dans <code>content/articles</code> : il apparaîtra ici après rechargement.</p>
      <div className="article-index-list">
        {articles.map((article) => <button type="button" key={article.slug} className={editingSlug === article.slug ? "article-choice active" : "article-choice"} onClick={() => startEditing(article)}>
          <span>{article.title}{!article.published ? <em className="disabled-tag">désactivé</em> : null}</span><small>{article.createdAt.slice(0, 10).replaceAll("-", "/")}</small>
        </button>)}
      </div>
    </aside>
    <form className="article-form" onSubmit={submit}>
      <div className="editor-heading">
        <span className="eyebrow">{editingArticle ? `édition / ${editingArticle.slug}.md` : "nouveau fichier"}</span>
        <div className="editor-actions">
          {editingArticle ? <a href={`/articles/${editingArticle.slug}`} target="_blank" rel="noreferrer" className="preview-link">Prévisualiser ↗</a> : null}
          {editingArticle ? <a href={`/api/articles/${editingArticle.slug}`} download={`${editingArticle.slug}.md`} className="reset-button">Exporter ↓</a> : null}
          <button type="button" className="reset-button" onClick={() => fileInputRef.current?.click()} disabled={importing}>{importing ? "import..." : "↑ importer .md + images"}</button>
          <input ref={fileInputRef} type="file" accept=".md,text/markdown,image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
          <button type="button" className="reset-button" onClick={() => folderInputRef.current?.click()} disabled={importing}>{importing ? "import..." : "↑ importer un dossier"}</button>
          <input
            ref={folderInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
            // @ts-expect-error webkitdirectory is a non-standard attribute not covered by the DOM typings
            webkitdirectory=""
          />
        </div>
      </div>
      {editingArticle ? <p className="preview-note">La preview ouvre la dernière version enregistrée.</p> : null}
    {editingArticle ? (
      <div className="field">
        <label htmlFor="slug">URL de l’article <span>/articles/{slug || "…"}</span></label>
        <input id="slug" value={slug} maxLength={70} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => setSlug(event.target.value)} placeholder="mon-article" required />
        {slug !== editingArticle.slug ? (
          <p className="form-status error" role="alert">
            ⚠️ Changer l’URL casse tous les liens existants vers <code>/articles/{editingArticle.slug}</code> (partages, favoris, résultats de recherche déjà indexés) — ils renverront une page 404. L’historique des vues sera reporté sur la nouvelle URL, mais pas les liens externes.
          </p>
        ) : null}
      </div>
    ) : null}
    <div className="field"><label htmlFor="title">Titre <span>{title.length}/{limits.title}</span></label><input id="title" value={title} maxLength={limits.title} onChange={(event) => setTitle(event.target.value)} placeholder="Le titre de votre note" required /></div>
    <div className="field"><label htmlFor="description">Description <span>{description.length}/{limits.description}</span></label><textarea id="description" value={description} maxLength={limits.description} onChange={(event) => setDescription(event.target.value)} placeholder="Une entrée en matière concise." rows={3} required /></div>
    <div className="field"><label htmlFor="keywords">Mots-clés <span>séparés par des virgules</span></label><input id="keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="nextjs, react, tutoriel" /></div>
    <div className="field"><label htmlFor="createdAt">Date de création</label><input id="createdAt" type="date" value={createdAt} onChange={(event) => setCreatedAt(event.target.value)} required /></div>
    <div className="field field-toggle"><label htmlFor="published">Visible sur le blog <span>{published ? "publié" : "désactivé, visible en admin uniquement"}</span></label><input id="published" type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /></div>
    <div className="field field-content"><label htmlFor="content">Contenu Markdown <span>{content.length}/{limits.content}</span></label><textarea id="content" value={content} maxLength={limits.content} onChange={(event) => setContent(event.target.value)} placeholder={"## Une idée claire\n\nÉcrivez votre article ici. **Markdown** et `code` sont pris en charge."} required /></div>

    <p className="preview-note">Traduction anglaise — laissez vide pour reprendre le texte français tel quel.</p>
    <div className="field"><label htmlFor="titleEn">Titre (EN) <span>{titleEn.length}/{limits.title}</span></label><input id="titleEn" value={titleEn} maxLength={limits.title} onChange={(event) => setTitleEn(event.target.value)} placeholder={title || "English title"} /></div>
    <div className="field"><label htmlFor="descriptionEn">Description (EN) <span>{descriptionEn.length}/{limits.description}</span></label><textarea id="descriptionEn" value={descriptionEn} maxLength={limits.description} onChange={(event) => setDescriptionEn(event.target.value)} placeholder={description || "English description"} rows={3} /></div>
    <div className="field field-content"><label htmlFor="contentEn">Contenu Markdown (EN) <span>{contentEn.length}/{limits.content}</span></label><textarea id="contentEn" value={contentEn} maxLength={limits.content} onChange={(event) => setContentEn(event.target.value)} placeholder={content || "English content"} /></div>
    {status && <p className={`form-status ${status.type}`} role="status">{status.message}</p>}
      <div className="article-form-actions">
        <button type="submit" disabled={loading}>{loading ? "enregistrement..." : editingArticle ? "Enregistrer les modifications →" : "Publier l’article →"}</button>
        {editingArticle ? <button type="button" className="delete-button" onClick={handleDelete} disabled={deleting}>{deleting ? "suppression..." : "Supprimer l'article"}</button> : null}
      </div>
    </form>
  </div>;
}
