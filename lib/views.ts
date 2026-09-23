import fs from "node:fs/promises";
import path from "node:path";

const viewsFile = path.join(process.cwd(), "content", "views.json");

async function readViews(): Promise<Record<string, number>> {
  try {
    return JSON.parse(await fs.readFile(viewsFile, "utf8"));
  } catch {
    return {};
  }
}

export async function getViewCount(slug: string): Promise<number> {
  const views = await readViews();
  return views[slug] ?? 0;
}

export async function getViewCounts(): Promise<Record<string, number>> {
  return readViews();
}

export async function incrementViewCount(slug: string): Promise<number> {
  const views = await readViews();
  views[slug] = (views[slug] ?? 0) + 1;
  await fs.writeFile(viewsFile, JSON.stringify(views, null, 2), "utf8");
  return views[slug];
}
