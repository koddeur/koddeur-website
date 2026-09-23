import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (hasSession) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!hasSession) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/articles") && !hasSession) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/articles/:path*"],
};
