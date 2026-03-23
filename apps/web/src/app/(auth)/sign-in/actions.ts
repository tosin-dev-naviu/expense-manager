"use server";

import { signInSchema } from "@expense-manager/validation";
import { redirect } from "next/navigation";

import { signIn } from "../../../auth/config";
import { isNextRedirectError } from "../../../lib/is-next-redirect-error";

export async function signInAction(formData: FormData) {
  const values = signInSchema.parse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    redirect("/sign-in?error=Invalid+email+or+password.");
  }
}
