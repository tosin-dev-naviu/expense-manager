import type { ReactNode } from "react";
import { db } from "@expense-manager/db";
import { headers } from "next/headers";

import { requireViewerMembership, getSignedInUser } from "../../auth/session";
import { AppShell } from "../../components/layout/app-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewer, user] = await Promise.all([
    requireViewerMembership(),
    getSignedInUser(),
  ]);

  const tenant = await db.tenant.findUnique({
    where: { id: viewer.tenantId },
    select: { name: true },
  });
  const headerStore = await headers();
  const path = headerStore.get("x-current-path") ?? "/dashboard";

  return (
    <AppShell
      currentPath={path}
      tenantName={tenant?.name ?? "Workspace"}
      userEmail={user?.email ?? "team@example.com"}
      userName={user?.name ?? "Team member"}
    >
      {children}
    </AppShell>
  );
}
