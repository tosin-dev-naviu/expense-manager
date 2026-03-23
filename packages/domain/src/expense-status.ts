export const expenseStatuses = ["draft", "pending", "approved", "rejected"] as const;

export type ExpenseStatus = (typeof expenseStatuses)[number];
