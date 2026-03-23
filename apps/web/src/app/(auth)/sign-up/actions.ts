"use server";

import { registerUser } from "@expense-manager/auth";
import { db } from "@expense-manager/db";
import { signUpSchema } from "@expense-manager/validation";
import { redirect } from "next/navigation";

import { signIn } from "../../../auth/config";

export async function signUpAction(formData: FormData) {
  const values = signUpSchema.parse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  const existingUser = await db.user.findUnique({
    where: { email: values.email },
    select: { id: true },
  });

  if (existingUser) {
    redirect("/sign-up?error=An+account+with+this+email+already+exists.");
  }

  await registerUser(values, { db });
  await signIn("credentials", {
    email: values.email,
    password: values.password,
    redirectTo: "/onboarding",
  });
}
