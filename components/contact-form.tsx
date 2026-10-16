"use client";

import { useState, type FormEvent } from "react";
import { Bi } from "@/components/i18n";
import { useLang } from "@/components/use-lang";
import { CONTACT_SUBJECTS, OTHER_SUBJECT, SUBJECT_MAX } from "@/lib/contact-subjects";

// Mail-style compose form shown when the /home laptop slides up. Posts to /api/contact.
type Status = "idle" | "sending" | "sent" | "error" | "rate";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<"email" | "subject" | "message" | null>(null);
  const [subject, setSubject] = useState<string>(CONTACT_SUBJECTS[0].key);
  const lang = useLang();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setProblem(null);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (response.ok) {
        form.reset();
        setSubject(CONTACT_SUBJECTS[0].key);
        return setStatus("sent");
      }
      const { error } = await response.json().catch(() => ({ error: "server" }));
      if (error === "email" || error === "subject" || error === "message") {
        setProblem(error);
        return setStatus("idle");
      }
      setStatus(error === "rate" ? "rate" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="mail-compose" onSubmit={submit} noValidate>
      <div className="mail-row">
        <span className="mail-label"><Bi fr="À :" en="To:" /></span>
        <span className="mail-to">koddeur</span>
      </div>
      <label className="mail-row">
        <span className="mail-label"><Bi fr="De :" en="From:" /></span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" aria-invalid={problem === "email" || undefined} />
      </label>
      <label className="mail-row">
        <span className="mail-label"><Bi fr="Objet :" en="Subject:" /></span>
        {/* macOS pop-up button look: rounded, with up/down chevrons drawn by .mail-select::after. */}
        <span className="mail-select">
          <select name="subject" value={subject} onChange={(event) => setSubject(event.target.value)}>
            {CONTACT_SUBJECTS.map((option) => <option key={option.key} value={option.key}>{option[lang]}</option>)}
            <option value={OTHER_SUBJECT}>{lang === "en" ? "Other…" : "Autre…"}</option>
          </select>
        </span>
      </label>
      {subject === OTHER_SUBJECT ? (
        <label className="mail-row">
          <span className="mail-label sr-only"><Bi fr="Objet libre" en="Custom subject" /></span>
          <input name="customSubject" type="text" required maxLength={SUBJECT_MAX} autoFocus placeholder={lang === "en" ? "Your subject" : "Ton objet"} aria-invalid={problem === "subject" || undefined} />
        </label>
      ) : null}

      <label className="mail-body">
        <span className="sr-only">Message</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={6} aria-invalid={problem === "message" || undefined} />
      </label>
      {/* Honeypot for bots: hidden from people and from keyboard navigation. */}
      <input className="mail-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="mail-footer">
        {/* Single status line next to the send button: progress, success and every error. */}
        <p className={problem || status === "error" || status === "rate" ? "mail-status mail-status-error" : "mail-status"} aria-live="polite">
          {problem === "email" ? <Bi fr="Adresse e-mail invalide." en="Invalid e-mail address." /> : null}
          {problem === "subject" ? <Bi fr="Précise l'objet du message." en="Please enter a subject." /> : null}
          {problem === "message" ? <Bi fr="Le message doit faire entre 10 et 2000 caractères." en="The message must be 10 to 2000 characters long." /> : null}
          {status === "sending" ? <Bi fr="Envoi…" en="Sending…" /> : null}
          {status === "sent" ? <Bi fr="Message envoyé, je te réponds vite !" en="Message sent, I'll get back to you soon!" /> : null}
          {status === "rate" ? <Bi fr="Trop de messages d'un coup, réessaie dans quelques minutes." en="Too many messages at once, try again in a few minutes." /> : null}
          {status === "error" ? <Bi fr="L'envoi a échoué, réessaie plus tard." en="Sending failed, please try again later." /> : null}
        </p>
        <button type="submit" className="mail-send" disabled={status === "sending"}><Bi fr="Envoyer" en="Send" /></button>
      </div>
    </form>
  );
}
