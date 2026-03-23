import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const architectureSpec = readFileSync(
  join(
    rootDir,
    "docs/plans/2026-03-23-multi-tenant-spend-management-architecture-spec.md",
  ),
  "utf8",
);
const implementationPlan = readFileSync(
  join(
    rootDir,
    "docs/plans/2026-03-23-multi-tenant-spend-management-implementation-plan.md",
  ),
  "utf8",
);

describe("architecture decision docs", () => {
  it("lock the required implementation decisions for bootstrap", () => {
    expect(architectureSpec).toContain("Auth.js` with credentials-based email/password");
    expect(architectureSpec).toContain("database-backed sessions");
    expect(architectureSpec).toContain("`MinIO`");
    expect(architectureSpec).toContain("`MailHog`");
    expect(architectureSpec).toContain("sends invitation emails through a generic SMTP transport");
    expect(architectureSpec).toContain(
      "tenant-owned queries always flow through helpers that require `tenant_id`",
    );
    expect(architectureSpec).toContain(
      "Upload metadata must be persisted before enqueuing extraction work",
    );
    expect(architectureSpec).toContain("Required payload fields:");
    expect(architectureSpec).toContain("`tenant_id`");
    expect(architectureSpec).toContain("`receipt_upload_id`");
    expect(architectureSpec).toContain("`created_by_user_id`");
    expect(architectureSpec).toContain("stable identifiers only");
    expect(architectureSpec).toContain(
      "reload tenant-scoped records from the database before mutating them",
    );

    expect(implementationPlan).toContain("Create: `package.json`");
    expect(implementationPlan).toContain("Create: `tests/repo/architecture-decisions.test.ts`");
    expect(implementationPlan).toContain("Auth.js credentials-based email/password");
    expect(implementationPlan).toContain("database sessions");
    expect(implementationPlan).toContain("`MinIO`");
    expect(implementationPlan).toContain("`MailHog`");
    expect(implementationPlan).toContain("SMTP-backed invites");
    expect(implementationPlan).toContain("repository helpers for tenant-scoped access");
    expect(implementationPlan).toContain("upload/job payload guarantees");
    expect(implementationPlan).toContain(
      "worker job payloads carry stable identifiers only",
    );
  });
});
