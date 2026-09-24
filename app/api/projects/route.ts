import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/articles";
import { projectsDirectory } from "@/lib/projects";

export const runtime = "nodejs";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const yamlString = (value: string) => JSON.stringify(value);
const cleanStatus = (value: unknown) => (value === "closed" ? "closed" : "online");

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = clean(payload.name);
    const image = clean(payload.image);
    const description = clean(payload.description);
    const githubUrl = clean(payload.githubUrl);
    const link = clean(payload.link);
    const status = cleanStatus(payload.status);
    if (!name || !description) return NextResponse.json({ error: "Nom et description sont requis." }, { status: 400 });
    if (name.length > 60 || description.length > 250 || image.length > 500 || githubUrl.length > 300 || link.length > 300) {
      return NextResponse.json({ error: "Un des champs dépasse la limite autorisée." }, { status: 400 });
    }
    const dateInput = clean(payload.date);
    const dateValue = dateInput ? new Date(dateInput) : new Date();
    if (Number.isNaN(dateValue.getTime())) return NextResponse.json({ error: "La date n'est pas valide." }, { status: 400 });
    await fs.mkdir(projectsDirectory, { recursive: true });
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      try { await fs.access(path.join(projectsDirectory, `${slug}.md`)); slug = `${baseSlug}-${suffix++}`; } catch { break; }
    }
    const date = dateValue.toISOString();
    const markdown = `---\nname: ${yamlString(name)}\ndate: ${yamlString(date)}\nimage: ${yamlString(image)}\ndescription: ${yamlString(description)}\ngithubUrl: ${yamlString(githubUrl)}\nlink: ${yamlString(link)}\nstatus: ${yamlString(status)}\n---\n`;
    await fs.writeFile(path.join(projectsDirectory, `${slug}.md`), markdown, "utf8");

    const nameEn = clean(payload.nameEn) || name;
    const descriptionEn = clean(payload.descriptionEn) || description;
    const translationMarkdown = `---\nname: ${yamlString(nameEn)}\ndescription: ${yamlString(descriptionEn)}\n---\n`;
    await fs.writeFile(path.join(projectsDirectory, `${slug}.en.md`), translationMarkdown, "utf8");

    return NextResponse.json({ slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le projet." }, { status: 500 });
  }
}
