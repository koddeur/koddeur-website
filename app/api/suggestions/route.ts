import { NextResponse } from "next/server";
import { getListedArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET() {
  const [articles, projects] = await Promise.all([getListedArticles(), getProjects()]);
  return NextResponse.json({
    articles: articles.slice(0, 3),
    projects: projects.slice(0, 3),
  });
}
