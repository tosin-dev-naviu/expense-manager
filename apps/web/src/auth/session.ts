import { resolveActiveMembership } from "@expense-manager/auth";
import { db } from "@expense-manager/db";
import { redirect } from "next/navigation";

import { auth } from "./config";

export async function getSignedInUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function getSignedInUserId() {
  const user = await getSignedInUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return user.id;
}

export async function getViewerMembership() {
  const user = await getSignedInUser();

  if (!user) {
    return null;
  }

  return resolveActiveMembership(user.id, { db });
}

export async function requireViewerMembership() {
  const user = await getSignedInUser();

  if (!user) {
    redirect("/sign-in");
  }

  const viewer = await resolveActiveMembership(user.id, { db });

  if (!viewer) {
    redirect("/onboarding");
  }

  return viewer;
}

export async function requireSignedInUserWithoutMembership() {
  const user = await getSignedInUser();

  if (!user) {
    redirect("/sign-in");
  }

  const viewer = await resolveActiveMembership(user.id, { db });

  if (viewer) {
    redirect("/dashboard");
  }

  return user;
}
