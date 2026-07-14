import * as z from "zod";

export const defendantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  ssn: z.string().nullable().optional().refine(
    (val) => !val || /^\d{3}-\d{2}-\d{4}$|^\d{9}$/.test(val),
    {
      message: "SSN must be 9 digits or in XXX-XX-XXXX format",
    }
  ),
  tags: z.array(z.string()).optional().default([]),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional().refine((val) => !val || /\S+@\S+\.\S+/.test(val), {
    message: "Invalid email format",
  }),
});

export type DefendantInput = z.infer<typeof defendantSchema>;
