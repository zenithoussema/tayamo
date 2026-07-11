import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { createSessionToken } from "@/lib/auth";

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server configuration error. Contact the administrator." },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  const rateLimitKey = `login:${ip}`;
  const { allowed } = checkRateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.",
        retryAfter: Math.ceil(LOGIN_WINDOW_MS / 1000),
      },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  if (password.trim() !== adminPassword) {
    return NextResponse.json(
      { error: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  resetRateLimit(rateLimitKey);

  try {
    await logAudit({ action: "Admin login", entity: "Auth", details: "Admin login successful" });
  } catch {
    // Non-blocking
  }

  const token = createSessionToken();

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4,
    path: "/",
  });

  return response;
}
