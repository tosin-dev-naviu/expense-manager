import { z } from "zod";

export const tenantOnboardingSchema = z.object({
  tenantName: z.string().trim().min(2, "Workspace name is required."),
  tenantSlug: z
    .string()
    .trim()
    .min(2, "Workspace slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  userId: z.string().min(1),
  userName: z.string().trim().min(1),
});
