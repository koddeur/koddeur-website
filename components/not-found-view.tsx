"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { highlightTitle } from "@/components/highlighted-title";
import { Bi } from "@/components/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { ProjectCard } from "@/components/project-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/articles";
import type { Project } from "@/lib/projects";

export function NotFoundView() {
  const pathname = usePathname() || "";
  const isProject = pathname.startsWith("/projects/");
  const isArticle = pathname.startsWith("/articles/");
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="shell">
      <header className="home-header">
        <div className="home-nav"><Logo href="/" mark={false} /><div className="nav-actions"><LanguageToggle /><ThemeToggle /></div></div>
        <h1 className="home-title not-found-title">404 <span className="not-found-subtitle"><Bi fr="page introuvable" en="page not found" /></span></h1>
      </header>

      <div className="not-found-hero">
        {isArticle ? (
          <p><Bi fr="Cet article est introuvable — il a peut-être été renommé ou dépublié." en="This article can't be found — it may have been renamed or unpublished." /></p>
        ) : isProject ? (
          <p><Bi fr="Ce projet est introuvable." en="This project can't be found." /></p>
        ) : (
          <p><Bi fr="Cette page n'existe pas." en="This page doesn't exist." /></p>
        )}
        <code className="not-found-path">{pathname}</code>
        <div className="not-found-links landing-links">
          <Link href="/" className="landing-link"><Bi fr="Accueil" en="Home" /></Link>
          <Link href="/blog" className="landing-link">Blog</Link>
          <Link href="/projects" className="landing-link"><Bi fr="Projets" en="Projects" /></Link>
        </div>
      </div>

      {isProject ? (
        projects.length ? (
          <section className="feed" aria-labelledby="suggested-projects">
            <div className="section-heading"><h2 id="suggested-projects"><Bi fr="Nos derniers projets" en="Our latest projects" /></h2></div>
            {projects.map((project) => <ProjectCard project={project} key={project.slug} />)}
          </section>
        ) : null
      ) : articles.length ? (
        <section className="feed" aria-labelledby="suggested-articles">
          <div className="section-heading"><h2 id="suggested-articles"><Bi fr="Derniers articles publiés" en="Latest published articles" /></h2></div>
          <ul className="compact-list">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link href={`/articles/${article.slug}`}>
                  <Bi fr={highlightTitle(article.title)} en={highlightTitle(article.en?.title ?? article.title)} />
                </Link>
                <time>{formatDate(article.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
