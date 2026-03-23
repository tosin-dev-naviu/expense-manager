import type { ActiveMembership } from "./session";

export function assertTenantAccess(
  viewer: ActiveMembership,
  tenantId: string,
): void {
  if (viewer.tenantId !== tenantId) {
    throw new Error("You do not have access to this tenant.");
  }
}

export function assertTeamAssigned(viewer: ActiveMembership): string {
  if (!viewer.teamId) {
    throw new Error("A team must be assigned before continuing.");
  }

  return viewer.teamId;
}
