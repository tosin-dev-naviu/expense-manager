"use server";

import { assertTeamAssigned, type ActiveMembership } from "@expense-manager/auth";
import { db, Prisma } from "@expense-manager/db";
import {
  draftExpenseSchema,
  draftExpenseUpdateSchema,
} from "@expense-manager/validation";

function toExpenseData(values: {
  merchantName?: string;
  description?: string;
  amount?: string;
  expenseDate?: string;
}) {
  return {
    merchantName: values.merchantName,
    description: values.description,
    amount: values.amount ? new Prisma.Decimal(values.amount) : undefined,
    expenseDate: values.expenseDate ? new Date(values.expenseDate) : undefined,
  };
}

export async function createDraftExpense(
  input: {
    merchantName?: string;
    description?: string;
    amount?: string;
    expenseDate?: string;
  },
  {
    db: database = db,
    viewer,
  }: { db?: typeof db; viewer: ActiveMembership },
) {
  const values = draftExpenseSchema.parse(input);

  return database.expense.create({
    data: {
      ...toExpenseData(values),
      createdByUserId: viewer.userId,
      status: "draft",
      teamId: assertTeamAssigned(viewer),
      tenantId: viewer.tenantId,
    },
  });
}

export async function updateDraftExpense(
  input: {
    draftExpenseId: string;
    merchantName?: string;
    description?: string;
    amount?: string;
    expenseDate?: string;
  },
  {
    db: database = db,
    viewer,
  }: { db?: typeof db; viewer: ActiveMembership },
) {
  const values = draftExpenseUpdateSchema.parse(input);
  const existingDraft = await database.expense.findFirst({
    where: {
      createdByUserId: viewer.userId,
      id: values.draftExpenseId,
      status: "draft",
      tenantId: viewer.tenantId,
    },
  });

  if (!existingDraft) {
    throw new Error("Draft expense not found.");
  }

  return database.expense.update({
    where: { id: values.draftExpenseId },
    data: toExpenseData(values),
  });
}

export async function createDraftExpenseAction(formData: FormData) {
  const { requireViewerMembership } = await import("../../auth/session");
  const viewer = await requireViewerMembership();

  return createDraftExpense(
    {
      merchantName: String(formData.get("merchantName") ?? ""),
      description: String(formData.get("description") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      expenseDate: String(formData.get("expenseDate") ?? ""),
    },
    { viewer },
  );
}

export async function updateDraftExpenseAction(formData: FormData) {
  const { requireViewerMembership } = await import("../../auth/session");
  const viewer = await requireViewerMembership();

  return updateDraftExpense(
    {
      draftExpenseId: String(formData.get("draftExpenseId") ?? ""),
      merchantName: String(formData.get("merchantName") ?? ""),
      description: String(formData.get("description") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      expenseDate: String(formData.get("expenseDate") ?? ""),
    },
    { viewer },
  );
}
