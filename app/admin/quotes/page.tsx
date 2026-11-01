import { AdminSectionSwitch } from "@/components/admin-section-switch";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";
import { MessageList } from "@/components/message-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { listMessages, type ContactMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

// Pre-quote requests sent from /devis (contact_messages rows of kind 'quote').
export default async function AdminQuotesPage() {
  let quotes: ContactMessage[] = [];
  let failed = false;
  try {
    quotes = await listMessages("quote");
  } catch {
    failed = true;
  }
  const unread = quotes.filter((quote) => !quote.read).length;
  return <main className="shell admin-shell monochrome glass-ui">
    <header className="article-nav">
      <Logo href="/" mark={false} />
      <div className="admin-nav-actions">
        <LogoutButton />
        <ThemeToggle />
      </div>
    </header>
    <AdminSectionSwitch active="quotes" />
    <section className="admin-heading"><span className="eyebrow">admin / devis</span><h1>Devis</h1><p>{quotes.length} demande{quotes.length > 1 ? "s" : ""} · {unread} non lue{unread > 1 ? "s" : ""}</p></section>
    {failed ? <p className="message-error" role="alert">Impossible de lire les devis (la colonne kind de contact_messages existe-t-elle ? Voir supabase/schema.sql).</p> : <MessageList initial={quotes} empty="Aucune demande de devis pour le moment." />}
  </main>;
}
