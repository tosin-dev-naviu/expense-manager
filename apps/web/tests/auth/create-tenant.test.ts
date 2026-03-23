import { describe, expect, it, vi } from "vitest";

import { createTenantForUser } from "../../src/app/actions/create-tenant";

describe("createTenantForUser", () => {
  it("creates a tenant, personal team, and tenant_admin membership", async () => {
    const db = {
      tenant: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      membership: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn().mockImplementation(async (callback) =>
        callback({
          tenant: {
            create: vi.fn().mockResolvedValue({
              id: "tenant_123",
              name: "Acme Finance",
              slug: "acme-finance",
            }),
          },
          team: {
            create: vi.fn().mockResolvedValue({
              id: "team_123",
              name: "Ada's team",
            }),
          },
          membership: {
            create: vi.fn().mockResolvedValue({
              id: "membership_123",
              role: "tenant_admin",
            }),
          },
        }),
      ),
    };

    const result = await createTenantForUser(
      {
        tenantName: "Acme Finance",
        tenantSlug: "acme-finance",
        userId: "user_123",
        userName: "Ada",
      },
      { db: db as never },
    );

    expect(result).toMatchObject({
      membershipId: "membership_123",
      role: "tenant_admin",
      teamId: "team_123",
      tenantId: "tenant_123",
    });
    expect(db.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: "acme-finance" },
      select: { id: true },
    });
  });

  it("rejects duplicate slugs", async () => {
    const db = {
      tenant: {
        findUnique: vi.fn().mockResolvedValue({ id: "tenant_existing" }),
      },
      membership: {
        findFirst: vi.fn(),
      },
    };

    await expect(
      createTenantForUser(
        {
          tenantName: "Acme Finance",
          tenantSlug: "acme-finance",
          userId: "user_123",
          userName: "Ada",
        },
        { db: db as never },
      ),
    ).rejects.toThrow("already in use");
  });
});
