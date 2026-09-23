import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { articlesDirectory, slugify } from "@/lib/articles";

export const runtime = "nodejs";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const yamlString = (value: string) => JSON.stringify(value);

export async function POST(request: Request) {
  try {
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
    const createdAtDate = createdAtInput ? new Date(createdAtInput) : new Date();
    if (Number.isNaN(createdAtDate.getTime())) return NextResponse.json({ error: "La date de création n'est pas valide." }, { status: 400 });
    const published = payload.published !== false;
    await fs.mkdir(articlesDirectory, { recursive: true });
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      try { await fs.access(path.join(articlesDirectory, `${slug}.md`)); slug = `${baseSlug}-${suffix++}`; } catch { break; }
    }
    const createdAt = createdAtDate.toISOString();
    const markdown = `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\ncreatedAt: ${yamlString(createdAt)}\nkeywords: [${keywords.map(yamlString).join(", ")}]\npublished: ${published}\n---\n\n${content}\n`;
    await fs.writeFile(path.join(articlesDirectory, `${slug}.md`), markdown, "utf8");
    return NextResponse.json({ slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer l’article." }, { status: 500 });
  }
}
