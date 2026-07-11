import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export type UserRole = "OWNER" | "MANAGER" | "TRAINER" | "RECEPTION";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  OWNER: ["*"],
  MANAGER: ["members:read", "members:write", "payments:read", "payments:write", "bookings:read", "bookings:write", "attendance:read", "coaches:read", "feedback:read", "feedback:write", "dashboard:read"],
  TRAINER: ["members:read", "attendance:read", "attendance:write", "dashboard:read"],
  RECEPTION: ["members:read", "members:write", "bookings:read", "bookings:write", "attendance:read", "attendance:write", "payments:read"],
};

function getSigningSecret(): string {
  const raw = process.env.ADMIN_PASSWORD || process.env.SESSION_SECRET;
  if (!raw) {
    throw new Error(
      "AUTH CRITICAL: Neither ADMIN_PASSWORD nor SESSION_SECRET is set. " +
      "Set ADMIN_PASSWORD in your Vercel dashboard under Settings > Environment Variables."
    );
  }
  return raw.trim();
}

function signToken(payload: string): string {
  const secret = getSigningSecret();
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token: string): { valid: boolean; payload?: Record<string, unknown> } {
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return { valid: false };

    const payload = token.substring(0, dotIndex);
    const receivedSig = token.substring(dotIndex + 1);

    const secret = getSigningSecret();
    const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");

    if (receivedSig.length !== expectedSig.length) return { valid: false };

    const sigBuffer = Buffer.from(receivedSig, "base64url");
    const expectedBuffer = Buffer.from(expectedSig, "base64url");

    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return { valid: false };

    const decoded = JSON.parse(payload) as Record<string, unknown>;

    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) return { valid: false };

    return { valid: true, payload: decoded };
  } catch {
    return { valid: false };
  }
}

export function createSessionToken(): string {
  const payload = {
    role: "OWNER" as UserRole,
    iat: Date.now(),
    exp: Date.now() + 4 * 60 * 60 * 1000,
  };
  return signToken(JSON.stringify(payload));
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(permission);
}

export function getAuthUser(request: NextRequest): { authenticated: boolean; role: UserRole } {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return { authenticated: false, role: "RECEPTION" };

  const { valid, payload } = verifyToken(token);
  if (!valid || !payload) return { authenticated: false, role: "RECEPTION" };

  return { authenticated: true, role: (payload.role as UserRole) || "OWNER" };
}

export function requireAuth(request: NextRequest): NextResponse | null {
  const auth = getAuthUser(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function requirePermission(request: NextRequest, permission: string): NextResponse | null {
  const auth = getAuthUser(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(auth.role, permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
