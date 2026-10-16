import { NextResponse } from "next/server";
import { deleteMessage, setMessageRead } from "@/lib/messages";

export const runtime = "nodejs";

// Admin-only (guarded by proxy.ts): mark a contact message read/unread, or delete it.
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function PATCH(request: Request, context: RouteContext<"/api/messages/[id]">) {
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
  const payload = await request.json().catch(() => ({}));
  if (typeof payload.read !== "boolean") return NextResponse.json({ error: "Champ read attendu." }, { status: 400 });
  try {
    await setMessageRead(id, payload.read);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/messages/[id]">) {
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
  try {
    await deleteMessage(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
