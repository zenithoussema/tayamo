import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/locale";
import { createHmac, timingSafeEqual } from "crypto";

function verifySessionCookie(request: NextRequest): boolean {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return false;

  try {
    const secret = process.env.ADMIN_PASSWORD || process.env.SESSION_SECRET;
    if (!secret) return false;

    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const payload = token.substring(0, dotIndex);
    const receivedSig = token.substring(dotIndex + 1);

    const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");

    if (receivedSig.length !== expectedSig.length) return false;

    const sigBuffer = Buffer.from(receivedSig, "base64url");
    const expectedBuffer = Buffer.from(expectedSig, "base64url");

    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const decoded = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));

    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  if (pathname.startsWith("/api")) return;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const response = NextResponse.next();
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      return response;
    }
    const authed = verifySessionCookie(request);
    if (!authed) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  request.nextUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
