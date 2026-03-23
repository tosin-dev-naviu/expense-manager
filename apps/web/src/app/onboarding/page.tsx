import { redirect } from "next/navigation";

import { createTenantAction } from "../actions/create-tenant";
import { requireSignedInUserWithoutMembership } from "../../auth/session";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { isNextRedirectError } from "../../lib/is-next-redirect-error";
import { slugify } from "../../lib/slugify";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await requireSignedInUserWithoutMembership();
  const params = (await searchParams) ?? {};
  const suggestedSlug = slugify(user.name ?? "workspace");

  return (
    <main className="auth-page">
      <Card className="auth-card auth-card--wide">
        <div className="auth-card__intro">
          <p className="eyebrow">Workspace onboarding</p>
          <h1>Set up your organization</h1>
          <p className="muted">
            This creates your tenant, your first team, and your admin membership.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            try {
              await createTenantAction(formData);
            } catch (error) {
              if (isNextRedirectError(error)) {
                throw error;
              }

              const message =
                error instanceof Error ? encodeURIComponent(error.message) : "Unknown+error";
              redirect(`/onboarding?error=${message}`);
            }

            redirect("/dashboard");
          }}
          className="auth-form"
        >
          <input name="userName" type="hidden" value={user.name ?? "Owner"} />
          <Input label="Workspace name" name="tenantName" required />
          <Input
            defaultValue={suggestedSlug}
            label="Workspace slug"
            name="tenantSlug"
            required
          />

          {params.error ? <p className="form-error">{params.error}</p> : null}

          <Button fullWidth type="submit">
            Create workspace
          </Button>
        </form>
      </Card>
    </main>
  );
}
