"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Une erreur est survenue." });
      setLoading(false);
    }
  }

  return (
    <main className="shell login-shell">
      <header className="article-nav"><Logo link={false} mark={false} /><ThemeToggle /></header>
      <section className="admin-heading"><span className="eyebrow">admin / connexion</span><h1>Espace réservé.</h1><p>Entrez le mot de passe pour accéder au dashboard.</p></section>
      <form className="article-form login-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required />
        </div>
        {status && <p className="form-status error" role="status">{status.message}</p>}
        <button type="submit" disabled={loading}>{loading ? "connexion..." : "Se connecter →"}</button>
      </form>
    </main>
  );
}
