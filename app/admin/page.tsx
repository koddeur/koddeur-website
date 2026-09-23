import Link from "next/link";
import { AdminSectionSwitch } from "@/components/admin-section-switch";
import { ArticleForm } from "@/components/article-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await getArticles();
  return <main className="shell admin-shell">
    <header className="article-nav">
      <Logo href="/" mark={false} />
      <div className="admin-nav-actions">
        <Link href="/blog" className="back-link">← Voir le blog</Link>
        <form action="/api/auth/logout" method="POST"><button type="submit" className="reset-button">Se déconnecter</button></form>
        <ThemeToggle />
      </div>
    </header>
    <AdminSectionSwitch active="articles" />
    <section className="admin-heading"><span className="eyebrow">admin / articles</span><h1>Mes articles</h1><p>Chaque article est un fichier <code>.md</code>. Ajoutez-les à la main ou sélectionnez-en un ci-dessous pour le modifier.</p></section>
    <ArticleForm articles={articles} />
  </main>;
}
