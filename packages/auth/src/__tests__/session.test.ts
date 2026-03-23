import { describe, expect, it, vi } from "vitest";

import {
  authenticateUser,
  hashPassword,
  resolveActiveMembership,
  verifyPassword,
} from "../index";

describe("auth helpers", () => {
  it("hashes and verifies a password", async () => {
    const password = "S3curePass!";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("authenticates a user with valid credentials", async () => {
    const password = "S3curePass!";
    const passwordHash = await hashPassword(password);
    const db = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user_123",
          email: "ada@example.com",
          passwordHash,
        }),
      },
    };

    await expect(
      authenticateUser(
        { email: "ada@example.com", password },
        { db: db as never },
      ),
    ).resolves.toMatchObject({ id: "user_123", email: "ada@example.com" });
  });

  it("resolves the active tenant membership context for a user", async () => {
    const db = {
      membership: {
        findFirst: vi.fn().mockResolvedValue({
          id: "membership_123",
          tenantId: "tenant_123",
          teamId: "team_123",
          role: "tenant_admin",
        }),
      },
    };

    await expect(
      resolveActiveMembership("user_123", { db: db as never }),
    ).resolves.toEqual({
      membershipId: "membership_123",
      role: "tenant_admin",
      teamId: "team_123",
      tenantId: "tenant_123",
      userId: "user_123",
    });
  });
});
