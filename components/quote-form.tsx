"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Bi } from "@/components/i18n";
import { DEADLINES, FEATURES, MAINTENANCE, PROJECT_TYPES, QUOTE_LIMITS, READINESS, type QuoteOption } from "@/lib/quote";

// /devis pre-quote questionnaire. Posts every answer to /api/quote, which turns it into a contact message.
type Status = "idle" | "sending" | "sent" | "error" | "rate";
type Problem = "email" | "types" | "description" | "length" | null;

function Choices({ name, options, multiple }: { name: string; options: QuoteOption[]; multiple?: boolean }) {
  return (
    <div className="quote-choices">
      {options.map((option) => (
        <label key={option.key} className="quote-choice">
          <input type={multiple ? "checkbox" : "radio"} name={name} value={option.key} />
          <span><Bi fr={option.fr} en={option.en} /></span>
        </label>
      ))}
    </div>
  );
}

function Question({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="quote-question">
      <legend>{label}{hint ? <span>{hint}</span> : null}</legend>
      {children}
    </fieldset>
  );
}

const optional = <Bi fr="facultatif" en="optional" />;

export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<Problem>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload: Record<string, unknown> = Object.fromEntries(data);
    payload.types = data.getAll("types");
    payload.features = data.getAll("features");
    setStatus("sending");
    setProblem(null);
    try {
      const response = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) {
        form.reset();
        return setStatus("sent");
      }
      const { error } = await response.json().catch(() => ({ error: "server" }));
      if (error === "email" || error === "types" || error === "description" || error === "length") {
        setProblem(error);
        return setStatus("idle");
      }
      setStatus(error === "rate" ? "rate" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="quote-done" role="status">
        <p><Bi fr="Merci, c'est bien reçu !" en="Thanks, got it!" /></p>
        <p><Bi fr="Je lis tout et je reviens vers toi par e-mail avec un devis chiffré, en général sous 48 h." en="I'll read everything and get back to you by e-mail with a priced quote, usually within 48 hours." /></p>
      </div>
    );
  }

  return (
    <form className="article-form quote-form" onSubmit={submit} noValidate>
      <section className="quote-section">
        <span className="eyebrow">01 / <Bi fr="toi" en="you" /></span>
        <div className="field"><label htmlFor="q-email">E-mail <span>*</span></label><input id="q-email" name="email" type="email" required maxLength={200} autoComplete="email" aria-invalid={problem === "email" || undefined} /></div>
        <div className="field"><label htmlFor="q-name"><Bi fr="Nom" en="Name" /> <span>{optional}</span></label><input id="q-name" name="name" maxLength={QUOTE_LIMITS.name} autoComplete="name" /></div>
        <div className="field"><label htmlFor="q-company"><Bi fr="Entreprise" en="Company" /> <span>{optional}</span></label><input id="q-company" name="company" maxLength={QUOTE_LIMITS.company} autoComplete="organization" /></div>
        <div className="field"><label htmlFor="q-industry"><Bi fr="Domaine d'activité" en="Industry" /> <span>{optional}</span></label><input id="q-industry" name="industry" maxLength={QUOTE_LIMITS.industry} /></div>
        <div className="field"><label htmlFor="q-website"><Bi fr="Site actuel" en="Current website" /> <span>{optional}</span></label><input id="q-website" name="website" type="url" maxLength={QUOTE_LIMITS.website} placeholder="https://" /></div>
      </section>

      <section className="quote-section">
        <span className="eyebrow">02 / <Bi fr="le projet" en="the project" /></span>
        <Question label={<Bi fr="Type de projet *" en="Project type *" />} hint={<Bi fr="plusieurs choix possibles" en="pick any" />}>
          <Choices name="types" options={PROJECT_TYPES} multiple />
          {problem === "types" ? <p className="quote-error"><Bi fr="Choisis au moins un type de projet." en="Pick at least one project type." /></p> : null}
        </Question>
        <div className="field">
          <label htmlFor="q-description"><Bi fr="Décris ton projet *" en="Describe your project *" /></label>
          <textarea id="q-description" name="description" required minLength={20} maxLength={QUOTE_LIMITS.description} rows={6} aria-invalid={problem === "description" || undefined} />
          <p className="quote-help"><Bi fr="Ce que tu veux faire, le problème à résoudre, ce qui se passe aujourd'hui sans cet outil." en="What you want to build, the problem it solves, how things work today without it." /></p>
          {problem === "description" ? <p className="quote-error"><Bi fr="Quelques phrases suffisent (20 caractères minimum)." en="A few sentences are enough (20 characters minimum)." /></p> : null}
        </div>
        <Question label={<Bi fr="Fonctionnalités souhaitées" en="Features you need" />} hint={optional}>
          <Choices name="features" options={FEATURES} multiple />
        </Question>
        <div className="field"><label htmlFor="q-audience"><Bi fr="Pour qui ?" en="Who is it for?" /> <span>{optional}</span></label><input id="q-audience" name="audience" maxLength={QUOTE_LIMITS.audience} /></div>
        <div className="field"><label htmlFor="q-tools"><Bi fr="Outils déjà utilisés à connecter" en="Tools you already use that should connect" /> <span>{optional}</span></label><input id="q-tools" name="tools" maxLength={QUOTE_LIMITS.tools} /></div>
        <div className="field"><label htmlFor="q-references"><Bi fr="Sites ou apps que tu aimes" en="Sites or apps you like" /> <span>{optional}</span></label><input id="q-references" name="references" maxLength={QUOTE_LIMITS.references} /></div>
      </section>

      <section className="quote-section">
        <span className="eyebrow">03 / <Bi fr="l'existant" en="what you have" /></span>
        <Question label={<Bi fr="Les contenus (textes, photos) sont prêts ?" en="Is the content (text, photos) ready?" />}><Choices name="content" options={READINESS} /></Question>
        <Question label={<Bi fr="Tu as déjà un logo / une charte graphique ?" en="Do you already have a logo / brand guidelines?" />}><Choices name="branding" options={READINESS} /></Question>
      </section>

      <section className="quote-section">
        <span className="eyebrow">04 / <Bi fr="le cadre" en="the frame" /></span>
        <Question label={<Bi fr="Délai souhaité" en="Timeline" />}><Choices name="deadline" options={DEADLINES} /></Question>
        <Question label={<Bi fr="Maintenance / suivi après la mise en ligne ?" en="Maintenance / support after launch?" />}><Choices name="maintenance" options={MAINTENANCE} /></Question>
        <div className="field"><label htmlFor="q-notes"><Bi fr="Autre chose à ajouter ?" en="Anything else?" /> <span>{optional}</span></label><textarea id="q-notes" name="notes" maxLength={QUOTE_LIMITS.notes} rows={3} /></div>
      </section>

      {/* Honeypot for bots: hidden from people and from keyboard navigation. */}
      <input className="mail-trap" name="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="article-form-actions">
        <button type="submit" disabled={status === "sending"}>{status === "sending" ? <Bi fr="Envoi…" en="Sending…" /> : <Bi fr="Envoyer ma demande" en="Send my request" />}</button>
        <p className={problem || status === "error" || status === "rate" ? "quote-status quote-error" : "quote-status"} aria-live="polite">
          {problem === "email" ? <Bi fr="Adresse e-mail invalide." en="Invalid e-mail address." /> : null}
          {problem === "types" || problem === "description" ? <Bi fr="Il manque une réponse obligatoire." en="A required answer is missing." /> : null}
          {problem === "length" ? <Bi fr="Une réponse est trop longue." en="One answer is too long." /> : null}
          {status === "rate" ? <Bi fr="Trop de demandes d'un coup, réessaie dans quelques minutes." en="Too many requests at once, try again in a few minutes." /> : null}
          {status === "error" ? <Bi fr="L'envoi a échoué, réessaie plus tard." en="Sending failed, please try again later." /> : null}
        </p>
      </div>
    </form>
  );
}
