import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/mail";
import { CONTACT_SUBJECTS, OTHER_SUBJECT, SUBJECT_MAX } from "@/lib/contact-subjects";
import { countRecentMessages, createMessage, hashIp } from "@/lib/messages";

export const runtime = "nodejs";

// Public endpoint for the /home contact window. Abuse limits: field bounds, a hidden honeypot
// field, and at most RATE_LIMIT messages per IP every RATE_WINDOW minutes.
const RATE_LIMIT = 3;
const RATE_WINDOW = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Drop control characters (keeping line breaks and tabs) and trim.
const clean = (value: unknown) => (typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "");

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field; pretend success to bots.
  if (clean(payload.website)) return NextResponse.json({ ok: true });

  const email = clean(payload.email).toLowerCase();
  const message = clean(payload.message);
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "email" }, { status: 400 });
  if (message.length < 10 || message.length > 2000) return NextResponse.json({ error: "message" }, { status: 400 });

  // Subject: a preset key (stored as its French label) or, for "other", the visitor's own text.
  const subjectKey = clean(payload.subject);
  const preset = CONTACT_SUBJECTS.find((option) => option.key === subjectKey);
  const subject = preset ? preset.fr : subjectKey === OTHER_SUBJECT ? clean(payload.customSubject).replace(/\s+/g, " ") : "";
  if (!subject || subject.length > SUBJECT_MAX) return NextResponse.json({ error: "subject" }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  try {
    if ((await countRecentMessages(ipHash, RATE_WINDOW)) >= RATE_LIMIT) return NextResponse.json({ error: "rate" }, { status: 429 });
    await createMessage({ email, subject, message, ipHash });
  } catch (error) {
    console.error("Enregistrement du message impossible :", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Stored first: a failed e-mail never loses the message (it is still in /admin/messages).
  await sendContactNotification({ email, subject, message }).catch((error) => console.error("Notification e-mail impossible :", error));
  return NextResponse.json({ ok: true });
}
