import { z } from "zod";

export const sendEmailSchema = z.object({
  defendantId: z.string().uuid("Invalid defendant ID"),
  to: z.string().email("Invalid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be under 200 characters"),
  body: z.string().min(1, "Email body is required"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export const emailTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Name must be under 100 characters"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be under 200 characters"),
  body: z.string().min(1, "Template body is required"),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
