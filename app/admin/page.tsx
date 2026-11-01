import Link from "next/link";
import { AdminSectionSwitch } from "@/components/admin-section-switch";
import { ArticleForm } from "@/components/article-form";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await getArticles();
  return <main className="shell admin-shell monochrome glass-ui">
    <header className="article-nav">
      <Logo href="/" mark={false} />
      <div className="admin-nav-actions">
        <LogoutButton />
        <ThemeToggle />
      </div>
    </header>
    <AdminSectionSwitch active="articles" />
    <section className="admin-heading"><span className="eyebrow">admin / articles</span><h1>Mes articles</h1><p><Link href="/blog" className="preview-link">Voir le blog ↗</Link></p></section>
    <ArticleForm articles={articles} />
  </main>;
}
