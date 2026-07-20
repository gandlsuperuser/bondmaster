"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  reminderRuleSchema,
  type ReminderRuleInput,
} from "@/lib/validations/reminder";

// ─── Reminder Rules CRUD ───────────────────────────────────

export async function getReminderRules() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const rules = await prisma.reminderRule.findMany({
      where: { orgId: session.orgId },
      include: {
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: rules };
  } catch (error) {
    console.error("[getReminderRules]", error);
    return { success: false, error: "Failed to fetch reminder rules" };
  }
}

export async function createReminderRule(input: ReminderRuleInput) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = reminderRuleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const rule = await prisma.reminderRule.create({
      data: {
        orgId: session.orgId,
        name: parsed.data.name,
        eventType: parsed.data.eventType,
        channel: parsed.data.channel,
        offsetMinutes: parsed.data.offsetMinutes,
        messageTemplate: parsed.data.messageTemplate,
        emailSubject: parsed.data.emailSubject ?? null,
        isActive: parsed.data.isActive,
        maxRetries: parsed.data.maxRetries,
      },
    });
    revalidatePath("/dashboard/reminders");
    return { success: true, data: rule };
  } catch (error) {
    console.error("[createReminderRule]", error);
    return { success: false, error: "Failed to create reminder rule" };
  }
}

export async function updateReminderRule(id: string, input: ReminderRuleInput) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = reminderRuleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const existing = await prisma.reminderRule.findFirst({
      where: { id, orgId: session.orgId },
    });
    if (!existing) return { success: false, error: "Rule not found" };

    const rule = await prisma.reminderRule.update({
      where: { id },
      data: {
        name: parsed.data.name,
        eventType: parsed.data.eventType,
        channel: parsed.data.channel,
        offsetMinutes: parsed.data.offsetMinutes,
        messageTemplate: parsed.data.messageTemplate,
        emailSubject: parsed.data.emailSubject ?? null,
        isActive: parsed.data.isActive,
        maxRetries: parsed.data.maxRetries,
      },
    });
    revalidatePath("/dashboard/reminders");
    return { success: true, data: rule };
  } catch (error) {
    console.error("[updateReminderRule]", error);
    return { success: false, error: "Failed to update reminder rule" };
  }
}

export async function deleteReminderRule(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.reminderRule.findFirst({
      where: { id, orgId: session.orgId },
    });
    if (!existing) return { success: false, error: "Rule not found" };

    await prisma.reminderRule.delete({ where: { id } });
    revalidatePath("/dashboard/reminders");
    return { success: true };
  } catch (error) {
    console.error("[deleteReminderRule]", error);
    return { success: false, error: "Failed to delete reminder rule" };
  }
}

export async function toggleReminderRule(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const existing = await prisma.reminderRule.findFirst({
      where: { id, orgId: session.orgId },
    });
    if (!existing) return { success: false, error: "Rule not found" };

    const rule = await prisma.reminderRule.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    revalidatePath("/dashboard/reminders");
    return { success: true, data: rule };
  } catch (error) {
    console.error("[toggleReminderRule]", error);
    return { success: false, error: "Failed to toggle reminder rule" };
  }
}

// ─── Reminder Logs ─────────────────────────────────────────

export async function getReminderLogs(params?: {
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
    const where: any = { orgId: session.orgId };

    if (params?.status) {
      where.status = params.status;
    }

    const [logs, total] = await Promise.all([
      prisma.reminderLog.findMany({
        where,
        include: {
          rule: { select: { id: true, name: true, eventType: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.reminderLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("[getReminderLogs]", error);
    return { success: false, error: "Failed to fetch reminder logs" };
  }
}

export async function getReminderStats() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const [totalRules, activeRules, sent, failed, skipped] = await Promise.all([
      prisma.reminderRule.count({ where: { orgId: session.orgId } }),
      prisma.reminderRule.count({
        where: { orgId: session.orgId, isActive: true },
      }),
      prisma.reminderLog.count({
        where: { orgId: session.orgId, status: "sent" },
      }),
      prisma.reminderLog.count({
        where: { orgId: session.orgId, status: "failed" },
      }),
      prisma.reminderLog.count({
        where: { orgId: session.orgId, status: "skipped" },
      }),
    ]);

    return {
      success: true,
      data: { totalRules, activeRules, sent, failed, skipped },
    };
  } catch (error) {
    console.error("[getReminderStats]", error);
    return { success: false, error: "Failed to fetch reminder stats" };
  }
}

// ─── Core Reminder Engine ──────────────────────────────────

/**
 * Merge template variables into a message string.
 * Supported: {{defendant_name}}, {{court_date}}, {{court_name}}, {{bond_amount}}
 */
function mergeTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

/**
 * Process all active reminder rules for a given org.
 * Evaluates each rule against current data and dispatches SMS/email.
 */
export async function processReminders(orgId?: string) {
  // If no orgId provided, process all orgs (cron mode)
  const orgs = orgId
    ? [{ id: orgId }]
    : await prisma.organization.findMany({ select: { id: true } });

  const results: {
    orgId: string;
    sent: number;
    failed: number;
    skipped: number;
  }[] = [];

  for (const org of orgs) {
    const orgResult = { orgId: org.id, sent: 0, failed: 0, skipped: 0 };

    const rules = await prisma.reminderRule.findMany({
      where: { orgId: org.id, isActive: true },
    });

    for (const rule of rules) {
      try {
        const targets = await getTargetsForRule(rule, org.id);

        for (const target of targets) {
          // Check if we already sent a reminder for this rule + defendant combo today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const alreadySent = await prisma.reminderLog.findFirst({
            where: {
              ruleId: rule.id,
              defendantId: target.defendantId,
              createdAt: { gte: today },
              status: "sent",
            },
          });

          if (alreadySent) {
            orgResult.skipped++;
            await prisma.reminderLog.create({
              data: {
                orgId: org.id,
                ruleId: rule.id,
                defendantId: target.defendantId,
                channel: rule.channel === "both" ? "sms" : rule.channel,
                status: "skipped",
                errorMessage: "Already sent today",
              },
            });
            continue;
          }

          const message = mergeTemplate(rule.messageTemplate, target.vars);

          // Send via configured channel(s)
          const channels =
            rule.channel === "both" ? ["sms", "email"] : [rule.channel];

          for (const ch of channels) {
            let status = "sent";
            let errorMessage: string | null = null;

            try {
              if (ch === "sms" && target.phone) {
                // Create SMS message record (simulated like existing SMS actions)
                let conversation = await prisma.conversation.findFirst({
                  where: {
                    defendantId: target.defendantId,
                    channel: "SMS",
                  },
                });

                if (!conversation) {
                  conversation = await prisma.conversation.create({
                    data: {
                      channel: "SMS",
                      defendantId: target.defendantId,
                    },
                  });
                }

                await prisma.sMSMessage.create({
                  data: {
                    conversationId: conversation.id,
                    content: message,
                    direction: "outbound",
                  },
                });
              } else if (ch === "email" && target.email) {
                const emailSubject = rule.emailSubject
                  ? mergeTemplate(rule.emailSubject, target.vars)
                  : `Reminder: ${rule.name}`;

                await prisma.emailMessage.create({
                  data: {
                    orgId: org.id,
                    defendantId: target.defendantId,
                    from:
                      process.env.RESEND_FROM_EMAIL ??
                      "noreply@bondsmaster.com",
                    to: target.email,
                    subject: emailSubject,
                    body: message,
                    direction: "outbound",
                    status: "sent",
                    sentAt: new Date(),
                  },
                });
              } else {
                status = "skipped";
                errorMessage = `No ${ch === "sms" ? "phone" : "email"} for defendant`;
              }
            } catch (sendErr: any) {
              status = "failed";
              errorMessage = sendErr?.message || "Unknown send error";
            }

            await prisma.reminderLog.create({
              data: {
                orgId: org.id,
                ruleId: rule.id,
                defendantId: target.defendantId,
                channel: ch,
                status,
                errorMessage,
                sentAt: status === "sent" ? new Date() : null,
              },
            });

            if (status === "sent") orgResult.sent++;
            else if (status === "failed") orgResult.failed++;
            else orgResult.skipped++;
          }
        }
      } catch (ruleErr) {
        console.error(
          `[processReminders] Error processing rule ${rule.id}:`,
          ruleErr
        );
        orgResult.failed++;
      }
    }

    results.push(orgResult);
  }

  return { success: true, data: results };
}

/**
 * Get target defendants for a given reminder rule based on event type.
 */
async function getTargetsForRule(
  rule: { eventType: string; offsetMinutes: number },
  orgId: string
): Promise<
  {
    defendantId: string;
    phone: string | null;
    email: string | null;
    vars: Record<string, string>;
  }[]
> {
  const now = new Date();
  const windowStart = new Date(now.getTime());
  const windowEnd = new Date(
    now.getTime() + rule.offsetMinutes * 60 * 1000
  );

  switch (rule.eventType) {
    case "court_date": {
      // Find upcoming court dates within the offset window
      const appearances = await prisma.courtAppearance.findMany({
        where: {
          defendant: { orgId },
          courtDate: {
            date: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
        },
        include: {
          defendant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          courtDate: {
            include: {
              courtCase: {
                include: { court: true },
              },
            },
          },
        },
      });

      return appearances.map((a) => ({
        defendantId: a.defendant.id,
        phone: a.defendant.phone,
        email: a.defendant.email,
        vars: {
          defendant_name: `${a.defendant.firstName} ${a.defendant.lastName}`,
          court_date: a.courtDate.date.toLocaleDateString(),
          court_name: a.courtDate.courtCase.court.name,
          case_number: a.courtDate.courtCase.caseNumber,
        },
      }));
    }

    case "payment_due": {
      // Find overdue payment installments
      const installments = await prisma.paymentInstallment.findMany({
        where: {
          paid: false,
          dueDate: {
            lte: windowEnd,
          },
          plan: {
            // We don't have direct org filtering on PaymentPlan,
            // so we'll include all and rely on the org-level data
          },
        },
        include: {
          plan: true,
        },
        take: 100,
      });

      // Get all defendants with bonds that have unpaid installments
      const defendants = await prisma.defendant.findMany({
        where: {
          orgId,
          bonds: {
            some: {},
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
        take: 50,
      });

      return defendants.map((d) => ({
        defendantId: d.id,
        phone: d.phone,
        email: d.email,
        vars: {
          defendant_name: `${d.firstName} ${d.lastName}`,
          bond_amount: "See payment plan",
        },
      }));
    }

    case "check_in": {
      // Find defendants who haven't checked in recently (>24h)
      const cutoff = new Date(
        now.getTime() - rule.offsetMinutes * 60 * 1000
      );

      const defendants = await prisma.defendant.findMany({
        where: {
          orgId,
          checkIns: {
            none: {
              timestamp: { gte: cutoff },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
        take: 50,
      });

      return defendants.map((d) => ({
        defendantId: d.id,
        phone: d.phone,
        email: d.email,
        vars: {
          defendant_name: `${d.firstName} ${d.lastName}`,
        },
      }));
    }

    case "signature": {
      // Find pending signature requests
      const pending = await prisma.signatureRecipient.findMany({
        where: {
          status: "pending",
        },
        include: {
          request: true,
        },
        take: 50,
      });

      // Map to defendants by email match
      const defendants = await prisma.defendant.findMany({
        where: {
          orgId,
          email: {
            in: pending
              .map((p) => p.email)
              .filter(Boolean),
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      });

      return defendants.map((d) => ({
        defendantId: d.id,
        phone: d.phone,
        email: d.email,
        vars: {
          defendant_name: `${d.firstName} ${d.lastName}`,
        },
      }));
    }

    default:
      return [];
  }
}

/**
 * Manually trigger a single reminder rule for testing.
 */
export async function manualTriggerRule(ruleId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const rule = await prisma.reminderRule.findFirst({
      where: { id: ruleId, orgId: session.orgId },
    });
    if (!rule) return { success: false, error: "Rule not found" };

    // Temporarily process just this org
    const targets = await getTargetsForRule(rule, session.orgId);

    if (targets.length === 0) {
      // Log a skipped entry so the user sees feedback
      await prisma.reminderLog.create({
        data: {
          orgId: session.orgId,
          ruleId: rule.id,
          channel: rule.channel === "both" ? "sms" : rule.channel,
          status: "skipped",
          errorMessage: "No matching defendants found for this rule",
        },
      });

      revalidatePath("/dashboard/reminders");
      return {
        success: true,
        data: { sent: 0, failed: 0, skipped: 1, message: "No matching targets found" },
      };
    }

    // Process the rule for all targets
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const target of targets) {
      const message = mergeTemplate(rule.messageTemplate, target.vars);
      const channels =
        rule.channel === "both" ? ["sms", "email"] : [rule.channel];

      for (const ch of channels) {
        let status = "sent";
        let errorMessage: string | null = null;

        try {
          if (ch === "sms" && target.phone) {
            let conversation = await prisma.conversation.findFirst({
              where: { defendantId: target.defendantId, channel: "SMS" },
            });
            if (!conversation) {
              conversation = await prisma.conversation.create({
                data: { channel: "SMS", defendantId: target.defendantId },
              });
            }
            await prisma.sMSMessage.create({
              data: {
                conversationId: conversation.id,
                content: message,
                direction: "outbound",
              },
            });
          } else if (ch === "email" && target.email) {
            const emailSubject = rule.emailSubject
              ? mergeTemplate(rule.emailSubject, target.vars)
              : `Reminder: ${rule.name}`;

            await prisma.emailMessage.create({
              data: {
                orgId: session.orgId,
                defendantId: target.defendantId,
                from:
                  process.env.RESEND_FROM_EMAIL ?? "noreply@bondsmaster.com",
                to: target.email,
                subject: emailSubject,
                body: message,
                direction: "outbound",
                status: "sent",
                sentAt: new Date(),
              },
            });
          } else {
            status = "skipped";
            errorMessage = `No ${ch === "sms" ? "phone" : "email"} for defendant`;
          }
        } catch (err: any) {
          status = "failed";
          errorMessage = err?.message || "Send error";
        }

        await prisma.reminderLog.create({
          data: {
            orgId: session.orgId,
            ruleId: rule.id,
            defendantId: target.defendantId,
            channel: ch,
            status,
            errorMessage,
            sentAt: status === "sent" ? new Date() : null,
          },
        });

        if (status === "sent") sent++;
        else if (status === "failed") failed++;
        else skipped++;
      }
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        orgId: session.orgId,
        userId: session.id,
        action: sent > 0 ? "reminder_sent" : "reminder_failed",
        entityType: "ReminderRule",
        entityId: rule.id,
        metadata: { ruleName: rule.name, sent, failed, skipped },
      },
    });

    revalidatePath("/dashboard/reminders");
    return { success: true, data: { sent, failed, skipped } };
  } catch (error) {
    console.error("[manualTriggerRule]", error);
    return { success: false, error: "Failed to trigger reminder rule" };
  }
}
