"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        defendant: {
          orgId: session.orgId,
        },
      },
      include: {
        defendant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error("[getConversations]", error);
    return { success: false, error: "Failed to fetch conversations" };
  }
}

export async function sendSMS(params: {
  defendantId: string;
  conversationId?: string;
  content: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    let conversationId = params.conversationId;

    // If conversation doesn't exist, create it
    if (!conversationId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          defendantId: params.defendantId,
          channel: "SMS",
        },
      });

      if (existing) {
        conversationId = existing.id;
      } else {
        const created = await prisma.conversation.create({
          data: {
            channel: "SMS",
            defendantId: params.defendantId,
          },
        });
        conversationId = created.id;
      }
    }

    // Save outbound message to DB
    const outboundMsg = await prisma.sMSMessage.create({
      data: {
        conversationId: conversationId!,
        content: params.content,
        direction: "outbound",
      },
    });

    // Simulate Twilio inbound response for demo purposes after 2 seconds
    // In a real application, Twilio webhook handles inbound responses
    setTimeout(async () => {
      try {
        await prisma.sMSMessage.create({
          data: {
            conversationId: conversationId!,
            content: `Thank you for the message. I will check and get back to you soon.`,
            direction: "inbound",
          },
        });
      } catch (err) {
        console.error("Failed to simulate incoming message", err);
      }
    }, 2000);

    revalidatePath("/dashboard/sms");
    return { success: true, data: outboundMsg };
  } catch (error) {
    console.error("[sendSMS]", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

export async function bulkSendSMS(params: {
  defendantIds: string[];
  content: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const results = [];
    for (const defendantId of params.defendantIds) {
      let conversation = await prisma.conversation.findFirst({
        where: {
          defendantId,
          channel: "SMS",
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            channel: "SMS",
            defendantId,
          },
        });
      }

      const msg = await prisma.sMSMessage.create({
        data: {
          conversationId: conversation.id,
          content: params.content,
          direction: "outbound",
        },
      });
      results.push(msg);
    }

    revalidatePath("/dashboard/sms");
    return { success: true, data: results };
  } catch (error) {
    console.error("[bulkSendSMS]", error);
    return { success: false, error: "Failed to broadcast bulk SMS" };
  }
}

export async function getTemplates() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: templates };
  } catch (error) {
    console.error("[getTemplates]", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function createTemplate(name: string, content: string) {
  try {
    const template = await prisma.messageTemplate.create({
      data: { name, content },
    });
    revalidatePath("/dashboard/sms");
    return { success: true, data: template };
  } catch (error) {
    console.error("[createTemplate]", error);
    return { success: false, error: "Failed to create template" };
  }
}
