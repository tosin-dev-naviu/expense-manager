import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const schemaPath = join(rootDir, "packages/db/prisma/schema.prisma");

describe("Prisma schema shape", () => {
  it("defines the core MVP models, enums, and tenant-scoped ownership fields", () => {
    const schema = readFileSync(schemaPath, "utf8");

    for (const enumName of ["Role", "ExpenseStatus", "ExtractionStatus"]) {
      expect(schema).toContain(`enum ${enumName}`);
    }

    for (const modelName of [
      "User",
      "Tenant",
      "Membership",
      "Invite",
      "Team",
      "Budget",
      "ReceiptUpload",
      "Expense",
      "Account",
      "Session",
      "VerificationToken",
    ]) {
      expect(schema).toContain(`model ${modelName}`);
    }

    expect(schema).toMatch(/tenantId\s+String/);
    expect(schema).toMatch(/userId\s+String/);
    expect(schema).toMatch(/teamId\s+String\?/);
    expect(schema).toMatch(/role\s+Role/);

    expect(schema).toMatch(/startsAt\s+DateTime/);
    expect(schema).toMatch(/endsAt\s+DateTime/);

    expect(schema).toMatch(/extractionStatus\s+ExtractionStatus/);
    expect(schema).toMatch(/objectKey\s+String/);
    expect(schema).toMatch(/mimeType\s+String/);

    expect(schema).toMatch(/status\s+ExpenseStatus/);
    expect(schema).toMatch(/budgetId\s+String\?/);
    expect(schema).toMatch(/receiptUploadId\s+String\?/);
    expect(schema).toMatch(/createdByUserId\s+String/);
    expect(schema).toMatch(/submittedByUserId\s+String\?/);
    expect(schema).toMatch(/submitterName\s+String\?/);
    expect(schema).toMatch(/submitterEmail\s+String\?/);
    expect(schema).toMatch(/submittedAt\s+DateTime\?/);

    expect(schema).toMatch(/sessionToken\s+String\s+@unique/);
    expect(schema).toMatch(/identifier\s+String/);
    expect(schema).toMatch(/token\s+String/);
  });
});
