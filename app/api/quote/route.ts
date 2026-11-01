import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/mail";
import { countRecentMessages, createMessage, hashIp } from "@/lib/messages";
import { DEADLINES, FEATURES, MAINTENANCE, PROJECT_TYPES, QUOTE_LIMITS, QUOTE_MESSAGE_MAX, READINESS, type QuoteOption } from "@/lib/quote";

export const runtime = "nodejs";

// Public endpoint for the /devis pre-quote form. Answers are checked against the option lists in
// lib/quote.ts, flattened into a readable text and stored as a contact message (shown in
// /admin/messages and e-mailed), with the same honeypot and per-IP rate limit as /api/contact.
const RATE_LIMIT = 3;
const RATE_WINDOW = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value: unknown) => (typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "");
const one = (options: QuoteOption[], value: unknown) => options.find((option) => option.key === value)?.fr ?? "";
const many = (options: QuoteOption[], value: unknown) => (Array.isArray(value) ? options.filter((option) => value.includes(option.key)).map((option) => option.fr) : []);

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field; pretend success to bots.
  if (clean(payload.trap)) return NextResponse.json({ ok: true });

  const email = clean(payload.email).toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "email" }, { status: 400 });

  const text: Record<keyof typeof QUOTE_LIMITS, string> = Object.fromEntries(
    Object.keys(QUOTE_LIMITS).map((key) => [key, clean(payload[key])]),
  ) as Record<keyof typeof QUOTE_LIMITS, string>;
  if ((Object.keys(QUOTE_LIMITS) as (keyof typeof QUOTE_LIMITS)[]).some((key) => text[key].length > QUOTE_LIMITS[key])) return NextResponse.json({ error: "length" }, { status: 400 });

  const types = many(PROJECT_TYPES, payload.types);
  if (!types.length) return NextResponse.json({ error: "types" }, { status: 400 });
  if (text.description.length < 20) return NextResponse.json({ error: "description" }, { status: 400 });

  const answer = (value: string | string[]) => (Array.isArray(value) ? value.join(", ") : value) || "—";
  const message = [
    `Nom : ${answer(text.name)}`,
    `Entreprise : ${answer(text.company)}`,
    `Domaine d'activité : ${answer(text.industry)}`,
    `Site actuel : ${answer(text.website)}`,
    "",
    `Type de projet : ${answer(types)}`,
    `Fonctionnalités : ${answer(many(FEATURES, payload.features))}`,
    "",
    `Projet :\n${text.description}`,
    "",
    `Public visé : ${answer(text.audience)}`,
    `Outils à connecter : ${answer(text.tools)}`,
    `Références appréciées : ${answer(text.references)}`,
    "",
    `Contenus prêts : ${answer(one(READINESS, payload.content))}`,
    `Identité visuelle : ${answer(one(READINESS, payload.branding))}`,
    `Délai : ${answer(one(DEADLINES, payload.deadline))}`,
    `Maintenance après livraison : ${answer(one(MAINTENANCE, payload.maintenance))}`,
    "",
    `Autres infos :\n${answer(text.notes)}`,
  ].join("\n").slice(0, QUOTE_MESSAGE_MAX);
  const subject = `Pré-devis · ${types.join(", ")}`.slice(0, 120);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  try {
    if ((await countRecentMessages(ipHash, RATE_WINDOW)) >= RATE_LIMIT) return NextResponse.json({ error: "rate" }, { status: 429 });
    await createMessage({ email, subject, message, ipHash, kind: "quote" });
  } catch (error) {
    console.error("Enregistrement du pré-devis impossible :", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  await sendContactNotification({ email, subject, message }).catch((error) => console.error("Notification e-mail impossible :", error));
  return NextResponse.json({ ok: true });
}
