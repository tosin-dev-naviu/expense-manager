import type { Role } from "@expense-manager/domain";

export type ActiveMembership = {
  userId: string;
  membershipId: string;
  tenantId: string;
  role: Role;
  teamId: string | null;
};

type MembershipRecord = {
  id: string;
  tenantId: string;
  role: Role;
  teamId: string | null;
};

type MembershipLookupDb = {
  membership: {
    findFirst(args: {
      where: { userId: string };
      orderBy?: { createdAt: "asc" | "desc" };
      select?: {
        id: true;
        tenantId: true;
        role: true;
        teamId: true;
      };
    }): Promise<MembershipRecord | null>;
  };
};

export async function resolveActiveMembership(
  userId: string,
  { db }: { db: MembershipLookupDb },
): Promise<ActiveMembership | null> {
  const membership = await db.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      tenantId: true,
      role: true,
      teamId: true,
    },
  });

  if (!membership) {
    return null;
  }

  return {
    userId,
    membershipId: membership.id,
    tenantId: membership.tenantId,
    role: membership.role,
    teamId: membership.teamId,
  };
}
