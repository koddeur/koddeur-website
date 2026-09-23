import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_DURATION_MS, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Impossible de vous connecter." }, { status: 500 });
  }
}
