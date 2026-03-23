export const roles = ["tenant_admin", "manager", "employee"] as const;

export type Role = (typeof roles)[number];
