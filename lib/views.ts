import fs from "node:fs/promises";
import path from "node:path";

// Stored outside the project directory (not `content/`, which is redeployed from git on
// every push) so view counts survive a fresh `git clone`/checkout on the server. Override
// with VIEWS_DATA_DIR if the default sibling folder doesn't fit your deployment layout.
const dataDir = process.env.VIEWS_DATA_DIR || path.join(process.cwd(), "..", "koddeur-data");
const viewsFile = path.join(dataDir, "views.json");

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
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(viewsFile, JSON.stringify(views, null, 2), "utf8");
  return views[slug];
}
