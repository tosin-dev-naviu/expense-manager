import { describe, expect, it, vi } from "vitest";

import {
  createDraftExpense,
  updateDraftExpense,
} from "../../src/app/actions/create-draft-expense";

describe("draft expense actions", () => {
  it("creates a tenant-scoped draft expense from the active membership", async () => {
    const db = {
      expense: {
        create: vi.fn().mockResolvedValue({
          id: "expense_123",
          tenantId: "tenant_123",
          teamId: "team_123",
          status: "draft",
          merchantName: "Chipotle",
        }),
      },
    };

    const result = await createDraftExpense(
      {
        merchantName: "Chipotle",
        description: "Team lunch",
      },
      {
        db: db as never,
        viewer: {
          membershipId: "membership_123",
          role: "tenant_admin",
          teamId: "team_123",
          tenantId: "tenant_123",
          userId: "user_123",
        },
      },
    );

    expect(result).toMatchObject({
      id: "expense_123",
      status: "draft",
      teamId: "team_123",
      tenantId: "tenant_123",
    });
    expect(db.expense.create).toHaveBeenCalled();
  });

  it("updates an existing draft expense for the active tenant", async () => {
    const db = {
      expense: {
        findFirst: vi.fn().mockResolvedValue({
          id: "expense_123",
          tenantId: "tenant_123",
          createdByUserId: "user_123",
          status: "draft",
        }),
        update: vi.fn().mockResolvedValue({
          id: "expense_123",
          description: "Updated description",
          tenantId: "tenant_123",
          status: "draft",
        }),
      },
    };

    const result = await updateDraftExpense(
      {
        draftExpenseId: "expense_123",
        description: "Updated description",
      },
      {
        db: db as never,
        viewer: {
          membershipId: "membership_123",
          role: "tenant_admin",
          teamId: "team_123",
          tenantId: "tenant_123",
          userId: "user_123",
        },
      },
    );

    expect(result).toMatchObject({
      id: "expense_123",
      description: "Updated description",
    });
    expect(db.expense.findFirst).toHaveBeenCalledWith({
      where: {
        createdByUserId: "user_123",
        id: "expense_123",
        status: "draft",
        tenantId: "tenant_123",
      },
    });
  });
});
