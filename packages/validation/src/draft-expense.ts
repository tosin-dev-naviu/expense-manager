import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }

  return value;
};

export const draftExpenseSchema = z.object({
  merchantName: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  description: z.preprocess(emptyToUndefined, z.string().max(240).optional()),
  amount: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimals.")
      .optional(),
  ),
  expenseDate: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const draftExpenseUpdateSchema = draftExpenseSchema.extend({
  draftExpenseId: z.string().min(1),
});

export type DraftExpenseInput = z.infer<typeof draftExpenseSchema>;
export type DraftExpenseUpdateInput = z.infer<typeof draftExpenseUpdateSchema>;
