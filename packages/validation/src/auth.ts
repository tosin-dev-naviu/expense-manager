import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email: z.email("Enter a valid email address.").transform((value) =>
    value.trim().toLowerCase(),
  ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) =>
    value.trim().toLowerCase(),
  ),
  password: z.string().min(1, "Password is required."),
});
