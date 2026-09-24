import fs from "node:fs/promises";
import path from "node:path";
import { contentRoot } from "@/lib/content-root";
import { getViewCount } from "@/lib/views";

export type ArticleTranslation = {
  title: string;
  description: string;
  content: string;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  keywords: string[];
  content: string;
  published: boolean;
  en?: ArticleTranslation;
  views: number;
};

export const articlesDirectory = path.join(contentRoot, "articles");

function unquote(value: string) {
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70) || "article";
}

export function parseArticle(source: string, slug: string): Article | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const fields = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const index = line.indexOf(":");
      return index > -1 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );
  const keywordsValue = unquote(fields.keywords || "[]");
  const keywords = keywordsValue
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(unquote)
    .filter(Boolean);

  if (!fields.title || !fields.description || !fields.createdAt) return null;
  return {
    slug,
    title: unquote(fields.title),
    description: unquote(fields.description),
    createdAt: unquote(fields.createdAt),
    keywords,
    content: match[2].trim(),
    published: unquote(fields.published ?? "true") !== "false",
    views: 0,
  };
}

export function parseArticleTranslation(source: string): ArticleTranslation | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const fields = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const index = line.indexOf(":");
      return index > -1 ? [[line.slice(0, index).trim(), line.slice(index + 1).trim()]] : [];
    }),
  );
  if (!fields.title || !fields.description) return null;
  return {
    title: unquote(fields.title),
    description: unquote(fields.description),
    content: match[2].trim(),
  };
}

async function readTranslation(slug: string): Promise<ArticleTranslation | undefined> {
  try {
    const source = await fs.readFile(path.join(articlesDirectory, `${slug}.en.md`), "utf8");
    return parseArticleTranslation(source) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const files = await fs.readdir(articlesDirectory);
    const articles = await Promise.all(
      files.filter((file) => file.endsWith(".md") && !file.endsWith(".en.md")).map(async (file) => {
        const slug = file.replace(/\.md$/, "");
        const source = await fs.readFile(path.join(articlesDirectory, file), "utf8");
        const article = parseArticle(source, slug);
        if (!article) return article;
        article.en = await readTranslation(slug);
        article.views = await getViewCount(slug);
        return article;
      }),
    );
    return articles.filter((article): article is Article => article !== null).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  } catch {
    return [];
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  return (await getArticles()).filter((article) => article.published);
}

export async function getArticle(slug: string) {
  const article = parseArticle(await fs.readFile(path.join(articlesDirectory, `${slug}.md`), "utf8"), slug);
  if (article) {
    article.en = await readTranslation(slug);
    article.views = await getViewCount(slug);
  }
  return article;
}

export { formatDate } from "@/lib/format";
