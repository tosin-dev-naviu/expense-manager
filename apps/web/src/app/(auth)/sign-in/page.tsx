import Link from "next/link";
import { redirect } from "next/navigation";

import { getViewerMembership, getSignedInUser } from "../../../auth/session";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { signInAction } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getSignedInUser();
  const viewer = await getViewerMembership();

  if (viewer) {
    redirect("/dashboard");
  }

  if (user) {
    redirect("/onboarding");
  }

  const params = (await searchParams) ?? {};

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__intro">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to ExpenseOS</h1>
          <p className="muted">
            Continue where you left off and access your team&apos;s draft workflows.
          </p>
        </div>

        <form action={signInAction} className="auth-form">
          <Input autoComplete="email" label="Email" name="email" required type="email" />
          <Input
            autoComplete="current-password"
            label="Password"
            name="password"
            required
            type="password"
          />

          {params.error ? <p className="form-error">{params.error}</p> : null}

          <Button fullWidth type="submit">
            Sign in
          </Button>
        </form>

        <p className="auth-card__footer">
          Need an account? <Link href="/sign-up">Create one</Link>
        </p>
      </Card>
    </main>
  );
}
