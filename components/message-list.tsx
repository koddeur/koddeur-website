"use client";

import { useState } from "react";
import type { ContactMessage } from "@/lib/messages";

// /admin/messages list: newest first, mark read/unread, delete, reply by e-mail.
export function MessageList({ initial }: { initial: ContactMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [error, setError] = useState("");

  async function toggleRead(message: ContactMessage) {
    const response = await fetch(`/api/messages/${message.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: !message.read }) });
    if (!response.ok) return setError("Mise à jour impossible.");
    setMessages((list) => list.map((item) => (item.id === message.id ? { ...item, read: !item.read } : item)));
  }

  async function remove(message: ContactMessage) {
    if (!window.confirm(`Supprimer le message de ${message.email} ?`)) return;
    const response = await fetch(`/api/messages/${message.id}`, { method: "DELETE" });
    if (!response.ok) return setError("Suppression impossible.");
    setMessages((list) => list.filter((item) => item.id !== message.id));
  }

  if (!messages.length) return <p className="message-empty">Aucun message pour le moment.</p>;
  return (
    <>
      {error ? <p className="message-error" role="alert">{error}</p> : null}
      <ul className="message-list">
        {messages.map((message) => (
          <li key={message.id} className={message.read ? "message-item" : "message-item unread"}>
            <div className="message-head">
              <a href={`mailto:${message.email}`} className="message-email">{message.email}</a>
              <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>
            </div>
            {message.subject ? <p className="message-subject">{message.subject}</p> : null}
            <p className="message-body">{message.message}</p>
            <div className="message-actions">
              <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "votre message sur koddeur.com"}`)}`} className="preview-link">Répondre ↗</a>
              <button type="button" className="reset-button" onClick={() => toggleRead(message)}>{message.read ? "Marquer non lu" : "Marquer lu"}</button>
              <button type="button" className="reset-button" onClick={() => remove(message)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
