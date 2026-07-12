import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  orgId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  mfaEnabled: boolean;
};

type JWTPayload = {
  sub: string;   // user id
  jti: string;   // unique token id (used for DB lookup)
  org: string;   // org id
  role: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = "bondsmaster-session";
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ─── Create Session ───────────────────────────────────────────────────────────

export async function createSession(
  user: { id: string; orgId: string; role: string },
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Sign JWT
  const token = await new SignJWT({ org: user.orgId, role: user.role } as Omit<JWTPayload, "sub" | "jti">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecret());

  // Store hash in DB
  const tokenHash = hashToken(jti);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  });

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// ─── Get Session ─────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify<JWTPayload>(token, getSecret());
    if (!payload.jti || !payload.sub) return null;

    // Verify session exists in DB (not revoked)
    const tokenHash = hashToken(payload.jti);
    const sessionRecord = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        user: { isActive: true },
      },
      include: {
        user: true,
      },
    });

    if (!sessionRecord) return null;

    const u = sessionRecord.user;
    return {
      id: u.id,
      orgId: u.orgId,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      avatarUrl: u.avatarUrl,
      mfaEnabled: u.mfaEnabled,
    };
  } catch {
    return null;
  }
}

// ─── Destroy Session ──────────────────────────────────────────────────────────

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      const { payload } = await jwtVerify<JWTPayload>(token, getSecret()).catch(
        () => ({ payload: null as any })
      );
      if (payload?.jti) {
        const tokenHash = hashToken(payload.jti);
        await prisma.session.delete({
          where: { tokenHash },
        }).catch(() => {});
      }
    }

    cookieStore.delete(COOKIE_NAME);
  } catch {
    // Best-effort cleanup
  }
}

// ─── Middleware Session Check (no cookies() — works in Edge) ──────────────────

export async function verifySessionToken(
  token: string
): Promise<{ userId: string; orgId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, getSecret());
    if (!payload.jti || !payload.sub) return null;
    return { userId: payload.sub, orgId: payload.org, role: payload.role };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
