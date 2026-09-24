import fs from "node:fs/promises";
import path from "node:path";

export type ProjectTranslation = {
  name: string;
  description: string;
};

export type ProjectStatus = "online" | "closed";

export const PROJECT_STATUSES: ProjectStatus[] = ["online", "closed"];

function parseStatus(value: string | undefined): ProjectStatus {
  return value === "closed" ? "closed" : "online";
}

export type Project = {
  slug: string;
  name: string;
  date: string;
  image: string;
  description: string;
  githubUrl: string;
  link: string;
  status: ProjectStatus;
  en?: ProjectTranslation;
};

export const projectsDirectory = path.join(process.cwd(), "content", "projects");

function unquote(value: string) {
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

export function parseProject(source: string, slug: string): Project | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const fields = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const index = line.indexOf(":");
      return index > -1 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );

  if (!fields.name || !fields.date || !fields.description) return null;
  return {
    slug,
    name: unquote(fields.name),
    date: unquote(fields.date),
    image: unquote(fields.image || ""),
    description: unquote(fields.description),
    githubUrl: unquote(fields.githubUrl || ""),
    link: unquote(fields.link || ""),
    status: parseStatus(fields.status ? unquote(fields.status) : undefined),
  };
}

function parseProjectTranslation(source: string): ProjectTranslation | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const fields = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const index = line.indexOf(":");
      return index > -1 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );
  if (!fields.name || !fields.description) return null;
  return { name: unquote(fields.name), description: unquote(fields.description) };
}

async function readTranslation(slug: string): Promise<ProjectTranslation | undefined> {
  try {
    const source = await fs.readFile(path.join(projectsDirectory, `${slug}.en.md`), "utf8");
    return parseProjectTranslation(source) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const files = await fs.readdir(projectsDirectory);
    const projects = await Promise.all(
      files.filter((file) => file.endsWith(".md") && !file.endsWith(".en.md")).map(async (file) => {
        const slug = file.replace(/\.md$/, "");
        const source = await fs.readFile(path.join(projectsDirectory, file), "utf8");
        const project = parseProject(source, slug);
        if (!project) return project;
        project.en = await readTranslation(slug);
        return project;
      }),
    );
    return projects.filter((project): project is Project => project !== null).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  } catch {
    return [];
  }
}

export async function getProject(slug: string) {
  const project = parseProject(await fs.readFile(path.join(projectsDirectory, `${slug}.md`), "utf8"), slug);
  if (project) project.en = await readTranslation(slug);
  return project;
}
