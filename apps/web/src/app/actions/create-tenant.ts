"use server";

import { db } from "@expense-manager/db";
import { tenantOnboardingSchema } from "@expense-manager/validation";

export async function createTenantForUser(
  input: {
    tenantName: string;
    tenantSlug: string;
    userId: string;
    userName: string;
  },
  { db: database = db }: { db?: typeof db } = {},
) {
  const values = tenantOnboardingSchema.parse(input);

  const existingTenant = await database.tenant.findUnique({
    where: { slug: values.tenantSlug },
    select: { id: true },
  });

  if (existingTenant) {
    throw new Error("That workspace slug is already in use.");
  }

  const existingMembership = await database.membership.findFirst({
    where: { userId: values.userId },
    select: { id: true },
  });

  if (existingMembership) {
    throw new Error("This account has already completed onboarding.");
  }

  return database.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: values.tenantName,
        slug: values.tenantSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const team = await tx.team.create({
      data: {
        tenantId: tenant.id,
        name: `${values.userName}'s team`,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const membership = await tx.membership.create({
      data: {
        tenantId: tenant.id,
        userId: values.userId,
        teamId: team.id,
        role: "tenant_admin",
      },
      select: {
        id: true,
        role: true,
      },
    });

    return {
      membershipId: membership.id,
      role: membership.role,
      teamId: team.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
    };
  });
}

export async function createTenantAction(formData: FormData) {
  const { getSignedInUserId } = await import("../../auth/session");
  const userId = await getSignedInUserId();
  const userName = String(formData.get("userName") ?? "");

  return createTenantForUser({
    tenantName: String(formData.get("tenantName") ?? ""),
    tenantSlug: String(formData.get("tenantSlug") ?? ""),
    userId,
    userName,
  });
}
