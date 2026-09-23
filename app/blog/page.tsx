import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

const TOP_TAGS_COUNT = 8;

type SortOrder = "asc" | "desc" | "views";

function buildHref(next: { tag?: string; sort?: SortOrder }) {
  const params = new URLSearchParams();
  if (next.tag) params.set("tag", next.tag);
  if (next.sort && next.sort !== "desc") params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogHome({ searchParams }: { searchParams: Promise<{ tag?: string; sort?: string }> }) {
  const { tag, sort } = await searchParams;
  const sortOrder: SortOrder = sort === "asc" || sort === "views" ? sort : "desc";
  const allArticles = await getPublishedArticles();

  const tagCounts = new Map<string, number>();
  for (const article of allArticles) {
    for (const keyword of article.keywords) tagCounts.set(keyword, (tagCounts.get(keyword) ?? 0) + 1);
  }
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_TAGS_COUNT);

  const filtered = tag ? allArticles.filter((article) => article.keywords.includes(tag)) : allArticles;
  const articles = [...filtered].sort((a, b) => {
    if (sortOrder === "views") return b.views - a.views;
    return sortOrder === "asc" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <main className="shell">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title">Blog</h1>
      </header>

      {topTags.length ? (
        <div className="tag-cloud" aria-label="Tags populaires">
          <span className="tag-cloud-label"><Bi fr="Tags populaires" en="Popular tags" /></span>
          <div className="tag-cloud-list">
            {topTags.map(([keyword, count]) => (
              <Link
                key={keyword}
                href={tag === keyword ? buildHref({ sort: sortOrder }) : buildHref({ tag: keyword, sort: sortOrder })}
                className={tag === keyword ? "tag-chip active" : "tag-chip"}
              >
                #{keyword} <span className="tag-count">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <section className="feed" aria-labelledby="latest-title">
        <div className="section-heading">
          <h2 id="latest-title"><Bi fr="Derniers articles" en="Latest articles" /></h2>
          <div className="section-heading-right">
            <div className="sort-control">
              <span><Bi fr="Trier" en="Sort" /></span>
              <Link href={buildHref({ tag, sort: "desc" })} className={sortOrder === "desc" ? "active" : undefined}><Bi fr="Plus récents" en="Newest" /></Link>
              <Link href={buildHref({ tag, sort: "asc" })} className={sortOrder === "asc" ? "active" : undefined}><Bi fr="Plus anciens" en="Oldest" /></Link>
              <Link href={buildHref({ tag, sort: "views" })} className={sortOrder === "views" ? "active" : undefined}><Bi fr="Plus vues" en="Most viewed" /></Link>
            </div>
          </div>
        </div>
        {tag ? <p className="filter-note"><Bi fr="Filtré par" en="Filtered by" /> <strong>#{tag}</strong><Link href={buildHref({ sort: sortOrder })}><Bi fr="réinitialiser" en="reset" /> ✕</Link></p> : null}
        {articles.length ? articles.map((article) => <ArticleCard article={article} key={article.slug} />) : (
          <div className="empty">
            <span>∅</span>
            {tag ? <p><Bi fr={`Aucun article avec le mot-clé #${tag}.`} en={`No article with the tag #${tag}.`} /></p> : <p><Bi fr="Aucun article publié pour le moment." en="No articles published yet." /></p>}
            {tag ? <Link href={buildHref({ sort: sortOrder })}><Bi fr="Voir tous les articles →" en="View all articles →" /></Link> : null}
          </div>
        )}
      </section>
      <footer>
        <span>© {new Date().getFullYear()} koddeur</span>
        <nav className="footer-links">
          <Link href="/"><Bi fr="Accueil" en="Home" /></Link>
          <Link href="/blog">Blog</Link>
          <Link href="/projects"><Bi fr="Projets" en="Projects" /></Link>
          <Link href="/about">About</Link>
        </nav>
      </footer>
    </main>
  );
}
