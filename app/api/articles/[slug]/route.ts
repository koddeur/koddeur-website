import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { articlesDirectory, parseArticle } from "@/lib/articles";

export const runtime = "nodejs";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const yamlString = (value: string) => JSON.stringify(value);

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function GET(request: Request, context: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  try {
    const source = await fs.readFile(path.join(articlesDirectory, `${slug}.md`), "utf8");
    return new Response(source, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.md"`,
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible d’exporter l’article." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  try {
    const filePath = path.join(articlesDirectory, `${slug}.md`);
    const existing = parseArticle(await fs.readFile(filePath, "utf8"), slug);
    if (!existing) return NextResponse.json({ error: "Le fichier Markdown est incomplet." }, { status: 400 });

    const payload = await request.json();
    const title = clean(payload.title);
    const description = clean(payload.description);
    const content = clean(payload.content);
    const keywords: string[] = Array.isArray(payload.keywords) ? (payload.keywords as unknown[]).map(clean).filter(Boolean) : [];
    if (!title || !description || !content) return NextResponse.json({ error: "Titre, description et contenu sont requis." }, { status: 400 });
    if (title.length > 50 || description.length > 300 || content.length > 10000 || keywords.some((keyword) => keyword.length > 30)) {
      return NextResponse.json({ error: "Un des champs dépasse la limite autorisée." }, { status: 400 });
    }
    const createdAtInput = clean(payload.createdAt);
    const createdAt = createdAtInput ? new Date(createdAtInput) : new Date(existing.createdAt);
    if (Number.isNaN(createdAt.getTime())) return NextResponse.json({ error: "La date de création n'est pas valide." }, { status: 400 });
    const published = payload.published !== false;

    const markdown = `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\ncreatedAt: ${yamlString(createdAt.toISOString())}\nkeywords: [${keywords.map(yamlString).join(", ")}]\npublished: ${published}\n---\n\n${content}\n`;
    await fs.writeFile(filePath, markdown, "utf8");
    return NextResponse.json({ slug });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible de mettre à jour l’article." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  try {
    await fs.unlink(path.join(articlesDirectory, `${slug}.md`));
    return NextResponse.json({ slug });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible de supprimer l’article." }, { status: 500 });
  }
}
