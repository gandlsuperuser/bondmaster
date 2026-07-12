import { SignJWT, jwtVerify } from "jose";
import { createHash } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { UserRoleEnum } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InviteTokenPayload = {
  email: string;
  role: string;
  orgId: string;
  type: "invite";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INVITE_DURATION_DAYS = 7;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ─── Create Invite ────────────────────────────────────────────────────────────

export async function createInvite(
  email: string,
  role: string,
  orgId: string,
  invitedByUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const expiresAt = new Date(
      Date.now() + INVITE_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    // Sign invite JWT
    const token = await new SignJWT({ email, role, orgId, type: "invite" } as InviteTokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${INVITE_DURATION_DAYS}d`)
      .sign(getSecret());

    const tokenHash = hashToken(token);

    // Upsert user as pending (no password_hash yet)
    await prisma.user.upsert({
      where: { email },
      update: {
        inviteTokenHash: tokenHash,
        inviteExpiresAt: expiresAt,
        invitedById: invitedByUserId,
        role: role as UserRoleEnum,
      },
      create: {
        orgId,
        email,
        role: role as UserRoleEnum,
        invitedById: invitedByUserId,
        inviteTokenHash: tokenHash,
        inviteExpiresAt: expiresAt,
        isActive: false,
      },
    });

    // Send invite email via Resend
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const inviteUrl = `${siteUrl}/invite/${encodeURIComponent(token)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@bondsmaster.com",
      to: email,
      subject: "You've been invited to BondsMaster",
      html: buildInviteEmail(inviteUrl, role, INVITE_DURATION_DAYS),
    });

    if (sendError) {
      console.error("[invite] Resend error:", sendError);
      return { success: false, error: "Failed to send invite email." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[invite] Error:", err);
    return { success: false, error: err.message ?? "Unexpected error." };
  }
}

// ─── Verify Invite Token ──────────────────────────────────────────────────────

export async function verifyInviteToken(
  token: string
): Promise<InviteTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<InviteTokenPayload>(token, getSecret());
    if (payload.type !== "invite") return null;

    const tokenHash = hashToken(token);

    // Check it's still stored (not already accepted)
    const user = await prisma.user.findFirst({
      where: {
        inviteTokenHash: tokenHash,
        inviteExpiresAt: { gt: new Date() },
      },
    });

    if (!user) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Email Template ───────────────────────────────────────────────────────────

function buildInviteEmail(
  inviteUrl: string,
  role: string,
  expiryDays: number
): string {
  const roleName = role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ");
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 16px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 480px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; }
    .logo { font-size: 20px; font-weight: 700; color: #2563eb; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
    .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 12px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; }
    .footer { color: #94a3b8; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🔒 BondsMaster</div>
    <h1>You've been invited!</h1>
    <p>You've been invited to join <strong>BondsMaster</strong> as a:</p>
    <div class="badge">\${roleName}</div>
    <p>Click the button below to accept your invitation and set up your account.</p>
    <a href="\${inviteUrl}" class="btn">Accept Invitation →</a>
    <p class="footer">
      This link expires in \${expiryDays} days. If you did not expect this invitation, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}
