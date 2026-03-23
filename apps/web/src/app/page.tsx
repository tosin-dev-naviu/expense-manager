import { redirect } from "next/navigation";

import { getViewerMembership, getSignedInUser } from "../auth/session";

export default async function HomePage() {
  const user = await getSignedInUser();

  if (!user) {
    redirect("/sign-in");
  }

  const viewer = await getViewerMembership();

  if (!viewer) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
