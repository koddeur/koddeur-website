import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseProject, projectsDirectory } from "@/lib/projects";

export const runtime = "nodejs";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const yamlString = (value: string) => JSON.stringify(value);
const cleanStatus = (value: unknown) => (value === "closed" ? "closed" : "online");

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function PUT(request: Request, context: RouteContext<"/api/projects/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });

  try {
    const filePath = path.join(projectsDirectory, `${slug}.md`);
    const existing = parseProject(await fs.readFile(filePath, "utf8"), slug);
    if (!existing) return NextResponse.json({ error: "Le fichier Markdown est incomplet." }, { status: 400 });

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
    const date = dateInput ? new Date(dateInput) : new Date(existing.date);
    if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "La date n'est pas valide." }, { status: 400 });

    const markdown = `---\nname: ${yamlString(name)}\ndate: ${yamlString(date.toISOString())}\nimage: ${yamlString(image)}\ndescription: ${yamlString(description)}\ngithubUrl: ${yamlString(githubUrl)}\nlink: ${yamlString(link)}\nstatus: ${yamlString(status)}\n---\n`;
    await fs.writeFile(filePath, markdown, "utf8");
    return NextResponse.json({ slug });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    return NextResponse.json({ error: "Impossible de mettre à jour le projet." }, { status: 500 });
  }
}
