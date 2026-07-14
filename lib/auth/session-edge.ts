/**
 * Edge-safe session utilities for use in middleware (proxy.ts).
 * Does NOT import `next/headers` or Prisma — those are server-only.
 */
import { jwtVerify } from "jose";

export const COOKIE_NAME = "bondsmaster-session";

type JWTPayload = {
  sub: string;
  jti: string;
  org: string;
  role: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

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
