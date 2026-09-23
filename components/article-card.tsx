import Link from "next/link";
import { highlightTitle } from "@/components/highlighted-title";
import { Bi } from "@/components/i18n";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/format";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card">
      <div className="article-card-main">
        <div className="article-meta"><time>{formatDate(article.createdAt)}</time><span>•</span><span>{article.keywords[0] || "note"}</span><span>•</span><span><Bi fr={`${article.views} ${article.views === 1 ? "vue" : "vues"}`} en={`${article.views} ${article.views === 1 ? "view" : "views"}`} /></span></div>
        <h2><Link href={`/articles/${article.slug}`}><Bi fr={highlightTitle(article.title)} en={highlightTitle(article.en?.title ?? article.title)} /></Link></h2>
        <p><Bi fr={article.description} en={article.en?.description ?? article.description} /></p>
        <div className="tag-row">{article.keywords.map((keyword) => <Link key={keyword} href={`/blog?tag=${encodeURIComponent(keyword)}`}>#{keyword}</Link>)}</div>
      </div>
    </article>
  );
}
