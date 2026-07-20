"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  sendEmailSchema,
  type SendEmailInput,
  emailTemplateSchema,
  type EmailTemplateInput,
} from "@/lib/validations/email";

// ─── Email Messages ────────────────────────────────────────

export async function getEmails(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 25;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {
      orgId: session.orgId,
    };

    if (params?.search) {
      where.OR = [
        { subject: { contains: params.search, mode: "insensitive" } },
        { to: { contains: params.search, mode: "insensitive" } },
        { body: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.status) {
      where.status = params.status;
    }

    const [emails, total] = await Promise.all([
      prisma.emailMessage.findMany({
        where,
        include: {
          defendant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.emailMessage.count({ where }),
    ]);

    return {
      success: true,
      data: {
        emails,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[getEmails]", error);
    return { success: false, error: "Failed to fetch emails" };
  }
}

export async function sendEmail(input: SendEmailInput) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  // Validate input
  const parsed = sendEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { defendantId, to, subject, body } = parsed.data;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@bondsmaster.com";

  try {
    // Save email record to DB first (queued status)
    const emailRecord = await prisma.emailMessage.create({
      data: {
        orgId: session.orgId,
        defendantId,
        from: fromEmail,
        to,
        subject,
        body,
        direction: "outbound",
        status: "queued",
      },
    });

    // Attempt to send via Resend
    let resendId: string | null = null;
    let status = "sent";
    let failedReason: string | null = null;

    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);
        const result = await resend.emails.send({
          from: fromEmail,
          to,
          subject,
          html: body,
        });

        if (result.error) {
          status = "failed";
          failedReason = result.error.message || "Resend API error";
        } else {
          resendId = result.data?.id ?? null;
          status = "sent";
        }
      } else {
        // No API key configured — mark as sent for demo purposes
        status = "sent";
      }
    } catch (sendErr: any) {
      status = "failed";
      failedReason = sendErr?.message || "Unknown send error";
    }

    // Update email record with send result
    const updated = await prisma.emailMessage.update({
      where: { id: emailRecord.id },
      data: {
        status,
        resendId,
        failedReason,
        sentAt: status === "sent" ? new Date() : null,
      },
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        orgId: session.orgId,
        userId: session.id,
        action: status === "sent" ? "email_sent" : "email_failed",
        entityType: "EmailMessage",
        entityId: emailRecord.id,
        metadata: { to, subject, status, failedReason },
      },
    });

    revalidatePath("/dashboard/email");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[sendEmail]", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function getEmailStats() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const [total, sent, delivered, opened, failed] = await Promise.all([
      prisma.emailMessage.count({ where: { orgId: session.orgId } }),
      prisma.emailMessage.count({
        where: { orgId: session.orgId, status: "sent" },
      }),
      prisma.emailMessage.count({
        where: { orgId: session.orgId, status: "delivered" },
      }),
      prisma.emailMessage.count({
        where: { orgId: session.orgId, status: "opened" },
      }),
      prisma.emailMessage.count({
        where: { orgId: session.orgId, status: "failed" },
      }),
    ]);

    return {
      success: true,
      data: { total, sent, delivered, opened, failed },
    };
  } catch (error) {
    console.error("[getEmailStats]", error);
    return { success: false, error: "Failed to fetch email stats" };
  }
}

// ─── Email Templates ───────────────────────────────────────

export async function getEmailTemplates() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { orgId: session.orgId },
      orderBy: { name: "asc" },
    });
    return { success: true, data: templates };
  } catch (error) {
    console.error("[getEmailTemplates]", error);
    return { success: false, error: "Failed to fetch email templates" };
  }
}

export async function createEmailTemplate(input: EmailTemplateInput) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = emailTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const template = await prisma.emailTemplate.create({
      data: {
        orgId: session.orgId,
        ...parsed.data,
      },
    });
    revalidatePath("/dashboard/email");
    return { success: true, data: template };
  } catch (error) {
    console.error("[createEmailTemplate]", error);
    return { success: false, error: "Failed to create email template" };
  }
}

export async function updateEmailTemplate(
  id: string,
  input: EmailTemplateInput
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = emailTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    // Verify the template belongs to this org
    const existing = await prisma.emailTemplate.findFirst({
      where: { id, orgId: session.orgId },
    });
    if (!existing) return { success: false, error: "Template not found" };

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/email");
    return { success: true, data: template };
  } catch (error) {
    console.error("[updateEmailTemplate]", error);
    return { success: false, error: "Failed to update email template" };
  }
}

export async function deleteEmailTemplate(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.emailTemplate.findFirst({
      where: { id, orgId: session.orgId },
    });
    if (!existing) return { success: false, error: "Template not found" };

    await prisma.emailTemplate.delete({ where: { id } });
    revalidatePath("/dashboard/email");
    return { success: true };
  } catch (error) {
    console.error("[deleteEmailTemplate]", error);
    return { success: false, error: "Failed to delete email template" };
  }
}
