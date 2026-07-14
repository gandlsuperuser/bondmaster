"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

// ─── Notes ──────────────────────────────────────────────────────────────────
export async function createNoteAction(
  defendantId: string,
  content: string,
  isPrivate: boolean
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    if (isPrivate) {
      const note = await prisma.privateNote.create({
        data: { defendantId, content },
      });
      return { success: true, data: note };
    } else {
      const note = await prisma.note.create({
        data: { defendantId, content },
      });
      return { success: true, data: note };
    }
  } catch (err: any) {
    console.error("[createNoteAction]", err);
    return { success: false, error: "Failed to create note" };
  } finally {
    revalidatePath(`/dashboard/defendants/${defendantId}`);
  }
}

// ─── Check-Ins ──────────────────────────────────────────────────────────────
export async function registerCheckInAction(params: {
  defendantId: string;
  status: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const { defendantId, status, lat, lng, photoUrl } = params;

  try {
    const checkIn = await prisma.checkIn.create({
      data: {
        defendantId,
        status,
        timestamp: new Date(),
        location:
          lat !== undefined && lng !== undefined
            ? {
                create: { lat, lng },
              }
            : undefined,
        photo: photoUrl
          ? {
              create: { url: photoUrl },
            }
          : undefined,
      },
    });

    return { success: true, data: checkIn };
  } catch (err: any) {
    console.error("[registerCheckInAction]", err);
    return { success: false, error: "Failed to submit check-in" };
  } finally {
    revalidatePath(`/dashboard/defendants/${defendantId}`);
  }
}

// ─── Communication ───────────────────────────────────────────────────────────
export async function sendSMSAction(defendantId: string, content: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // Check if conversation exists or create one
    let conversation = await prisma.conversation.findFirst({
      where: { defendantId, channel: "sms" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { defendantId, channel: "sms" },
      });
    }

    const message = await prisma.sMSMessage.create({
      data: {
        conversationId: conversation.id,
        content,
        direction: "outbound",
      },
    });

    return { success: true, data: message };
  } catch (err: any) {
    console.error("[sendSMSAction]", err);
    return { success: false, error: "Failed to send SMS" };
  } finally {
    revalidatePath(`/dashboard/defendants/${defendantId}`);
  }
}

export async function sendEmailAction(
  defendantId: string,
  subject: string,
  body: string,
  to: string
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const email = await prisma.emailMessage.create({
      data: {
        defendantId,
        subject,
        body,
        to,
      },
    });

    return { success: true, data: email };
  } catch (err: any) {
    console.error("[sendEmailAction]", err);
    return { success: false, error: "Failed to send email" };
  } finally {
    revalidatePath(`/dashboard/defendants/${defendantId}`);
  }
}

// ─── Payments ────────────────────────────────────────────────────────────────
export async function createPaymentAction(bondId: string, amount: number, defendantId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const payment = await prisma.payment.create({
      data: {
        bondId,
        amount,
        date: new Date(),
      },
    });
    return { success: true, data: payment };
  } catch (err: any) {
    console.error("[createPaymentAction]", err);
    return { success: false, error: "Failed to record payment" };
  } finally {
    revalidatePath(`/dashboard/defendants/${defendantId}`);
  }
}
