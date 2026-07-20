import { z } from "zod";

export const reminderRuleSchema = z.object({
  name: z
    .string()
    .min(1, "Rule name is required")
    .max(100, "Name must be under 100 characters"),
  eventType: z.enum(["court_date", "payment_due", "check_in", "signature"], {
    message: "Event type is required",
  }),
  channel: z.enum(["sms", "email", "both"], {
    message: "Channel is required",
  }),
  offsetMinutes: z
    .number()
    .int()
    .min(0, "Offset must be 0 or greater")
    .max(43200, "Offset cannot exceed 30 days"),
  messageTemplate: z
    .string()
    .min(1, "Message template is required")
    .max(1000, "Template must be under 1000 characters"),
  emailSubject: z.string().max(200).optional().nullable(),
  isActive: z.boolean().default(true),
  maxRetries: z.number().int().min(0).max(10).default(2),
});

export type ReminderRuleInput = z.infer<typeof reminderRuleSchema>;
