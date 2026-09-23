import { NextResponse } from "next/server";
import { getArticle } from "@/lib/articles";
import { getViewCount, incrementViewCount } from "@/lib/views";

export const runtime = "nodejs";

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function GET(request: Request, context: RouteContext<"/api/views/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  return NextResponse.json({ views: await getViewCount(slug) });
}

export async function POST(request: Request, context: RouteContext<"/api/views/[slug]">) {
  const { slug } = await context.params;
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  const article = await getArticle(slug);
  if (!article || !article.published) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

  return NextResponse.json({ views: await incrementViewCount(slug) });
}
