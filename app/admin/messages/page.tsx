import { AdminSectionSwitch } from "@/components/admin-section-switch";
import { Logo } from "@/components/logo";
import { MessageList } from "@/components/message-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { listMessages, type ContactMessage } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let messages: ContactMessage[] = [];
  let failed = false;
  try {
    messages = await listMessages();
  } catch {
    failed = true;
  }
  const unread = messages.filter((message) => !message.read).length;
  return <main className="shell admin-shell">
    <header className="article-nav">
      <Logo href="/" mark={false} />
      <div className="admin-nav-actions">
        <form action="/api/auth/logout" method="POST"><button type="submit" className="reset-button">Se déconnecter</button></form>
        <ThemeToggle />
      </div>
    </header>
    <AdminSectionSwitch active="messages" />
    <section className="admin-heading"><span className="eyebrow">admin / messages</span><h1>Messages</h1><p>{messages.length} message{messages.length > 1 ? "s" : ""} · {unread} non lu{unread > 1 ? "s" : ""}</p></section>
    {failed ? <p className="message-error" role="alert">Impossible de lire les messages (la table contact_messages existe-t-elle dans Supabase ?).</p> : <MessageList initial={messages} />}
  </main>;
}
