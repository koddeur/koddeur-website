import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { highlightTitle } from "@/components/highlighted-title";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { MarkdownContent } from "@/components/markdown-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { ViewTracker } from "@/components/view-tracker";
import { formatDate, getArticle } from "@/lib/articles";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article;
  try { article = await getArticle(slug); } catch { notFound(); }
  if (!article) notFound();
  if (!article.published) {
    const hasSession = isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
    if (!hasSession) notFound();
  }
  return (
    <main className="shell article-shell">
      <header className="article-nav"><Logo href="/" mark={false} /><div className="nav-actions"><LanguageToggle /><ThemeToggle /></div></header>
      <article className="article-page">
        {!article.published ? <p className="draft-banner"><Bi fr="Article désactivé — visible uniquement en admin." en="Draft article — visible to admin only." /></p> : null}
        <div className="article-kicker"><Link href="/blog" className="back-link"><Bi fr="← Tous les articles" en="← All articles" /></Link></div>
        <h1><Bi fr={highlightTitle(article.title)} en={highlightTitle(article.en?.title ?? article.title)} /></h1>
        <p className="publish-date">
          <Bi fr="Publié le" en="Published on" /> <time>{formatDate(article.createdAt)}</time>
          <span className="view-count"> · <Bi fr={`${article.views} ${article.views === 1 ? "vue" : "vues"}`} en={`${article.views} ${article.views === 1 ? "view" : "views"}`} /></span>
        </p>
        {article.published ? <ViewTracker slug={article.slug} /> : null}
        <p className="article-description"><Bi fr={article.description} en={article.en?.description ?? article.description} /></p>
        <div className="tag-row article-tags">{article.keywords.map((keyword) => <span key={keyword}>#{keyword}</span>)}</div>
        <div className="article-rule" />
        <div data-i18n="fr"><MarkdownContent content={article.content} /></div>
        <div data-i18n="en"><MarkdownContent content={article.en?.content ?? article.content} /></div>
      </article>
      <footer><span>© {new Date().getFullYear()} koddeur</span></footer>
    </main>
  );
}
