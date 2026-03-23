import Link from "next/link";
import { redirect } from "next/navigation";

import { getViewerMembership, getSignedInUser } from "../../../auth/session";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { signUpAction } from "./actions";

export default async function SignUpPage({
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
          <p className="eyebrow">Self-serve workspace setup</p>
          <h1>Create your expense workspace</h1>
          <p className="muted">
            Start with a secure account, then create the organization shell for your team.
          </p>
        </div>

        <form action={signUpAction} className="auth-form">
          <Input autoComplete="name" label="Full name" name="name" required />
          <Input autoComplete="email" label="Email" name="email" required type="email" />
          <Input
            autoComplete="new-password"
            label="Password"
            name="password"
            required
            type="password"
          />

          {params.error ? <p className="form-error">{params.error}</p> : null}

          <Button fullWidth type="submit">
            Create account
          </Button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
