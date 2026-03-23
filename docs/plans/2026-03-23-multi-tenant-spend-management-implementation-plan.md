# Multi-Tenant Spend Management MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first production-shaped version of the multi-tenant expense manager as a pnpm/Turborepo monorepo with a Next.js web app, a separate BullMQ worker, shared packages, and the MVP user flows described in the PRD and architecture spec, after first locking the implementation decisions that the docs now require.

**Architecture:** The repo is a web-first monorepo rooted at `/Users/ayomideologundudu/new-expense-manager`, with `apps/web` handling UI, Auth.js, server actions, and route handlers, and `apps/worker` handling BullMQ jobs. PostgreSQL, Prisma, Redis, `MinIO`, and `MailHog` form the local shared infrastructure baseline. Tenant isolation is enforced with explicit `tenant_id` scoping through shared repository helpers rather than ad hoc raw queries.

**Tech Stack:** pnpm, Turborepo, Next.js App Router, TypeScript, Auth.js with database sessions, PostgreSQL, Prisma, Redis, BullMQ, S3-compatible object storage via `MinIO`, SMTP email with `MailHog` locally, Docker Compose, Playwright, Vitest

---

### Task 0: Lock Clarified Architecture Decisions In Docs

**Status:** Done

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tests/repo/architecture-decisions.test.ts`
- Modify: `docs/plans/2026-03-23-multi-tenant-spend-management-architecture-spec.md`
- Modify: `docs/plans/2026-03-23-multi-tenant-spend-management-implementation-plan.md`

**Step 1: Write the failing doc-consistency check**

Create a minimal root `package.json` with `vitest` as a dev dependency so the repo can execute a single doc-consistency test before the monorepo bootstrap work begins.

Add a lightweight repo test at `tests/repo/architecture-decisions.test.ts` asserting the docs explicitly mention:
- Auth.js credentials-based email/password
- database sessions
- `MinIO`
- `MailHog`
- SMTP-backed invites
- repository helpers for tenant-scoped access
- upload metadata persists before enqueue
- worker job payloads carry stable identifiers only
- workers reload tenant-scoped records from the database before mutating them

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/repo/architecture-decisions.test.ts`
Expected: FAIL because the decisions are not fully documented yet.

**Step 3: Write minimal implementation**

Update the current docs so the implementation phase is decision complete for:
- auth and session strategy
- invite delivery
- local object storage and email services
- tenant-scoped data-access enforcement
- upload/job payload guarantees

Required wording outcomes:
- Auth.js credentials-based email/password remain the only MVP auth mechanism.
- Auth.js uses database sessions, not JWT sessions, for the MVP.
- Local object storage is `MinIO`.
- Local invite/email inspection uses `MailHog`.
- Invites are delivered through an SMTP-backed email flow.
- Tenant-owned reads and writes must go through shared repository helpers that require `tenant_id`.
- Upload metadata is persisted before enqueueing extraction jobs.
- Worker job payloads carry stable identifiers only, and workers reload tenant-scoped records from the database before mutating them.

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run tests/repo/architecture-decisions.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json package-lock.json docs/plans/2026-03-23-multi-tenant-spend-management-architecture-spec.md docs/plans/2026-03-23-multi-tenant-spend-management-implementation-plan.md tests/repo/architecture-decisions.test.ts
git commit -m "docs: lock implementation decisions before bootstrap"
```

### Task 1: Bootstrap Monorepo Foundation

**Status:** Done

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `tsconfig.base.json`
- Create: `apps/web/package.json`
- Create: `apps/worker/package.json`
- Create: `packages/db/package.json`
- Create: `packages/auth/package.json`
- Create: `packages/validation/package.json`
- Create: `packages/queue/package.json`
- Create: `packages/domain/package.json`

**Step 1: Write the failing repo-shape test**

Create a lightweight repo-smoke test at `tests/repo/structure.test.ts` asserting the expected top-level app/package directories and workspace config files exist.

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/repo/structure.test.ts`
Expected: FAIL because the workspace files and directories do not exist yet.

**Step 3: Write minimal implementation**

Create the monorepo root files and empty app/package folders with package manifests that establish:
- `pnpm` workspaces
- `turbo` pipeline placeholders
- shared TypeScript base config
- root scripts for `dev`, `build`, `lint`, `test`, and `e2e`
- environment placeholders for database sessions, SMTP, Redis, `MinIO`, and OpenAI integration

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run tests/repo/structure.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json turbo.json .gitignore .env.example tsconfig.base.json apps packages tests/repo/structure.test.ts
git commit -m "chore: bootstrap monorepo foundation"
```

### Task 2: Add Build-Ready Local Infrastructure

**Files:**
- Create: `docker-compose.yml`
- Create: `Dockerfile.web`
- Create: `Dockerfile.worker`
- Create: `apps/web/Dockerfile`
- Create: `apps/worker/Dockerfile`
- Modify: `.env.example`
- Create: `docs/local-development.md`
- Test: `tests/repo/local-stack.test.ts`

**Step 1: Write the failing infrastructure test**

Add `tests/repo/local-stack.test.ts` to assert the compose file declares `web`, `worker`, `postgres`, `redis`, `minio`, and `mailhog` services and that the env example exposes the expected database, auth, SMTP, Redis, `MinIO`, and OpenAI connection-variable groups.

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/repo/local-stack.test.ts`
Expected: FAIL because the compose and env files are incomplete.

**Step 3: Write minimal implementation**

Create Docker and Compose assets that define the local runtime shape without full production automation:
- Postgres service
- Redis service
- `MinIO` local object storage service
- `MailHog` local SMTP service
- web container
- worker container

Document boot steps in `docs/local-development.md`.

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run tests/repo/local-stack.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add docker-compose.yml Dockerfile.web Dockerfile.worker apps/web/Dockerfile apps/worker/Dockerfile .env.example docs/local-development.md tests/repo/local-stack.test.ts
git commit -m "chore: add local infrastructure baseline"
```

### Task 3: Establish Prisma Schema and Shared Database Package

**Files:**
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/domain/src/roles.ts`
- Create: `packages/domain/src/expense-status.ts`
- Create: `packages/domain/src/extraction-status.ts`
- Test: `packages/db/src/__tests__/schema-shape.test.ts`

**Step 1: Write the failing schema test**

Add `packages/db/src/__tests__/schema-shape.test.ts` to assert the Prisma schema includes core tenant-owned models and fields:
- `User`
- `Tenant`
- `Membership`
- `Team`
- `Budget`
- `ReceiptUpload`
- `DraftExpense`
- `ExpenseRequest`

Also assert explicit `tenant_id` ownership on tenant-scoped models and `budget_id` on draft/submitted expense records.
Include `Invite` plus the Auth.js session tables needed for database-backed sessions.

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run packages/db/src/__tests__/schema-shape.test.ts`
Expected: FAIL because the schema does not exist yet.

**Step 3: Write minimal implementation**

Create the initial Prisma schema and shared DB package exports. Include:
- role enum
- expense status enum
- extraction status enum
- tenant membership relationship
- invite token, status, expiration, and optional team assignment support
- database-backed Auth.js session persistence
- many-budgets-over-time support
- optional receipt relation on draft/submitted expenses

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run packages/db/src/__tests__/schema-shape.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/db packages/domain
git commit -m "feat: add tenant-aware prisma schema"
```

### Task 4: Implement Auth.js and Self-Serve Tenant Creation

**Files:**
- Create: `apps/web/src/auth/config.ts`
- Create: `apps/web/src/auth/session.ts`
- Create: `packages/auth/src/index.ts`
- Create: `packages/auth/src/authorization.ts`
- Create: `apps/web/src/app/(auth)/sign-up/page.tsx`
- Create: `apps/web/src/app/(auth)/sign-in/page.tsx`
- Create: `apps/web/src/app/(app)/onboarding/page.tsx`
- Create: `apps/web/src/app/actions/create-tenant.ts`
- Test: `apps/web/tests/auth/create-tenant.test.ts`
- Test: `apps/web/e2e/auth-signup.spec.ts`

**Step 1: Write the failing tests**

Write:
- a unit/integration test that verifies sign-up plus tenant creation produces an initial `tenant_admin` membership
- a unit/integration test that verifies Auth.js uses database-backed sessions and exposes active tenant membership context
- a Playwright test that covers sign-up, onboarding, and arrival in the authenticated app

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/web/tests/auth/create-tenant.test.ts`
- `npm exec playwright test apps/web/e2e/auth-signup.spec.ts`

Expected: FAIL because auth and onboarding are not implemented.

**Step 3: Write minimal implementation**

Add Auth.js configuration and the self-serve onboarding flow:
- email/password sign-up
- credentials provider with database sessions
- tenant creation page
- initial membership creation as `tenant_admin`
- session helpers that expose tenant context

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/web/tests/auth/create-tenant.test.ts`
- `npm exec playwright test apps/web/e2e/auth-signup.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/auth apps/web/src/app packages/auth apps/web/tests/auth/create-tenant.test.ts apps/web/e2e/auth-signup.spec.ts
git commit -m "feat: add auth and tenant onboarding"
```

### Task 5: Build Manual Draft Expense Flow

**Files:**
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`
- Create: `apps/web/src/app/(app)/expenses/new/page.tsx`
- Create: `apps/web/src/app/actions/create-draft-expense.ts`
- Create: `apps/web/src/app/actions/update-draft-expense.ts`
- Create: `packages/validation/src/draft-expense.ts`
- Test: `apps/web/tests/expenses/draft-expense.test.ts`
- Test: `apps/web/e2e/manual-draft-expense.spec.ts`

**Step 1: Write the failing tests**

Write:
- a unit/integration test that verifies a tenant user can create and update a draft expense without a receipt
- a Playwright test for dashboard entry, manual draft creation, draft editing, and persistence

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/web/tests/expenses/draft-expense.test.ts`
- `npm exec playwright test apps/web/e2e/manual-draft-expense.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Build the first authenticated app shell and manual-draft UI:
- dashboard placeholder
- manual expense entry point
- server actions for draft create/update
- validation schema for required draft fields

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/web/tests/expenses/draft-expense.test.ts`
- `npm exec playwright test apps/web/e2e/manual-draft-expense.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app packages/validation apps/web/tests/expenses/draft-expense.test.ts apps/web/e2e/manual-draft-expense.spec.ts
git commit -m "feat: add manual draft expense flow"
```

### Task 6: Submit Drafts as Expense Requests

**Files:**
- Create: `apps/web/src/app/actions/submit-expense-request.ts`
- Modify: `packages/validation/src/draft-expense.ts`
- Create: `packages/domain/src/request-status.ts`
- Test: `apps/web/tests/expenses/submit-expense.test.ts`
- Test: `apps/web/e2e/submit-expense.spec.ts`

**Step 1: Write the failing tests**

Write:
- a test that verifies a valid draft becomes a `pending` expense request
- a test that verifies submission requires amount, merchant/description, and date
- a Playwright submission-flow test

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/web/tests/expenses/submit-expense.test.ts`
- `npm exec playwright test apps/web/e2e/submit-expense.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Add server action and UI wiring to convert a draft into a submitted request while preserving tenant ownership and optional receipt behavior.

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/web/tests/expenses/submit-expense.test.ts`
- `npm exec playwright test apps/web/e2e/submit-expense.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app/actions packages/domain apps/web/tests/expenses/submit-expense.test.ts apps/web/e2e/submit-expense.spec.ts
git commit -m "feat: submit draft expenses as pending requests"
```

### Task 7: Add Invites, Roles, Teams, and Team-Scoped Visibility

**Files:**
- Create: `apps/web/src/app/actions/invite-user.ts`
- Create: `apps/web/src/app/actions/accept-invite.ts`
- Create: `apps/web/src/app/actions/create-team.ts`
- Create: `apps/web/src/email/send-invite-email.ts`
- Create: `apps/web/src/app/(app)/settings/team/page.tsx`
- Create: `apps/web/src/app/(app)/expenses/page.tsx`
- Modify: `packages/auth/src/authorization.ts`
- Test: `apps/web/tests/auth/invite-user.test.ts`
- Test: `packages/auth/src/__tests__/authorization.test.ts`
- Test: `apps/web/e2e/invite-and-team-access.spec.ts`

**Step 1: Write the failing tests**

Write:
- authorization tests for tenant check then role/team check
- an invite test that verifies invite creation sends through the configured SMTP transport and acceptance rejects expired or already-consumed invites
- a Playwright flow for inviting a user, assigning a role/team, and verifying manager-only team visibility

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run packages/auth/src/__tests__/authorization.test.ts`
- `npm exec playwright test apps/web/e2e/invite-and-team-access.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- SMTP-backed invite creation and acceptance
- roles `tenant_admin`, `manager`, `employee`
- team creation and assignment
- expense list filtered by tenant and team scope
- local development delivery through `MailHog`

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run packages/auth/src/__tests__/authorization.test.ts`
- `npm exec playwright test apps/web/e2e/invite-and-team-access.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app apps/web/src/email packages/auth apps/web/tests/auth/invite-user.test.ts apps/web/e2e/invite-and-team-access.spec.ts
git commit -m "feat: add invites roles and team-scoped access"
```

### Task 8: Add Budgets and Budget-Linked Submission

**Files:**
- Create: `apps/web/src/app/actions/create-budget.ts`
- Create: `apps/web/src/app/(app)/budgets/page.tsx`
- Modify: `apps/web/src/app/actions/submit-expense-request.ts`
- Create: `packages/validation/src/budget.ts`
- Test: `apps/web/tests/budgets/create-budget.test.ts`
- Test: `apps/web/tests/expenses/budget-linking.test.ts`
- Test: `apps/web/e2e/budget-linking.spec.ts`

**Step 1: Write the failing tests**

Write:
- a budget creation test
- a budget-linking test that rejects submission without a tenant-valid `budget_id`
- a Playwright flow that creates a budget and submits an expense against it

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/web/tests/budgets/create-budget.test.ts apps/web/tests/expenses/budget-linking.test.ts`
- `npm exec playwright test apps/web/e2e/budget-linking.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- budget create flow
- budget overview page
- required `budget_id` on submission
- validation that budget and team belong to the active tenant

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/web/tests/budgets/create-budget.test.ts apps/web/tests/expenses/budget-linking.test.ts`
- `npm exec playwright test apps/web/e2e/budget-linking.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app packages/validation apps/web/tests/budgets/create-budget.test.ts apps/web/tests/expenses/budget-linking.test.ts apps/web/e2e/budget-linking.spec.ts
git commit -m "feat: add budgets and budget-linked submission"
```

### Task 9: Implement Approval Flow and Over-Budget Warnings

**Files:**
- Create: `apps/web/src/app/actions/approve-expense-request.ts`
- Create: `apps/web/src/app/actions/reject-expense-request.ts`
- Modify: `apps/web/src/app/(app)/expenses/page.tsx`
- Test: `apps/web/tests/expenses/approval-flow.test.ts`
- Test: `apps/web/e2e/approval-flow.spec.ts`

**Step 1: Write the failing tests**

Write:
- a test for manager approval within own team
- a test for tenant-admin approval tenant-wide
- a test for over-budget warning calculation/display semantics
- a Playwright approval/rejection flow

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/web/tests/expenses/approval-flow.test.ts`
- `npm exec playwright test apps/web/e2e/approval-flow.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Implement single-step approval with:
- approve/reject server actions
- permission enforcement
- UI status transitions
- over-budget warnings on submit/review surfaces

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/web/tests/expenses/approval-flow.test.ts`
- `npm exec playwright test apps/web/e2e/approval-flow.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app/actions apps/web/src/app/(app)/expenses/page.tsx apps/web/tests/expenses/approval-flow.test.ts apps/web/e2e/approval-flow.spec.ts
git commit -m "feat: add approval flow and budget warnings"
```

### Task 10: Add Receipt Upload Contract and Queue Producers

**Files:**
- Create: `apps/web/src/app/api/uploads/presign/route.ts`
- Create: `apps/web/src/app/actions/record-upload.ts`
- Create: `packages/queue/src/receipt-extraction.ts`
- Create: `packages/validation/src/upload.ts`
- Test: `packages/queue/src/__tests__/receipt-extraction-job.test.ts`
- Test: `apps/web/e2e/receipt-upload.spec.ts`

**Step 1: Write the failing tests**

Write:
- a queue contract test asserting `receipt_extraction_job` payload shape includes tenant, upload, and draft resolution identifiers
- a queue contract test asserting upload metadata persists before enqueue and the payload includes tenant, upload, and creator identifiers
- a Playwright test for requesting an upload session and recording uploaded metadata

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run packages/queue/src/__tests__/receipt-extraction-job.test.ts`
- `npm exec playwright test apps/web/e2e/receipt-upload.spec.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- presigned upload route handler
- upload metadata persistence
- queue producer for `receipt_extraction_job`
- upload validation schemas
- `MinIO`-compatible upload configuration

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run packages/queue/src/__tests__/receipt-extraction-job.test.ts`
- `npm exec playwright test apps/web/e2e/receipt-upload.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src/app/api/uploads apps/web/src/app/actions/record-upload.ts packages/queue packages/validation apps/web/e2e/receipt-upload.spec.ts
git commit -m "feat: add upload contract and queue producers"
```

### Task 11: Implement Worker Consumer and Extraction Normalization

**Files:**
- Create: `apps/worker/src/index.ts`
- Create: `apps/worker/src/jobs/receipt-extraction-job.ts`
- Create: `apps/worker/src/openai/extract-receipt.ts`
- Create: `apps/worker/src/normalize/expense-draft.ts`
- Test: `apps/worker/src/__tests__/receipt-extraction-job.test.ts`
- Test: `apps/worker/src/__tests__/expense-draft-normalization.test.ts`

**Step 1: Write the failing tests**

Write:
- a worker test for successful extraction producing a normalized draft payload
- a worker test for partial/failure extraction still yielding a user-completable draft when possible
- a normalization test for idempotent handling of one upload to one active draft

**Step 2: Run tests to verify they fail**

Run:
- `npm exec vitest run apps/worker/src/__tests__/receipt-extraction-job.test.ts apps/worker/src/__tests__/expense-draft-normalization.test.ts`

Expected: FAIL.

**Step 3: Write minimal implementation**

Implement:
- BullMQ worker bootstrap
- OpenAI extraction adapter
- draft normalization logic
- partial extraction handling
- idempotent draft upsert behavior keyed by receipt upload
- tenant-scoped record loading through shared repository helpers

**Step 4: Run tests to verify they pass**

Run:
- `npm exec vitest run apps/worker/src/__tests__/receipt-extraction-job.test.ts apps/worker/src/__tests__/expense-draft-normalization.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/worker
git commit -m "feat: add receipt extraction worker"
```

### Task 12: Finalize Critical-Path Coverage and Repo Readiness

**Files:**
- Modify: `package.json`
- Modify: `turbo.json`
- Create: `.github/workflows/ci.yml`
- Modify: `docs/local-development.md`
- Create: `README.md`
- Test: `apps/web/e2e/*.spec.ts`
- Test: `apps/web/tests/**/*`
- Test: `apps/worker/src/__tests__/*`

**Step 1: Write the failing CI/readiness test**

Add a repo-level smoke test at `tests/repo/ci-readiness.test.ts` asserting the presence of:
- CI workflow
- root scripts for lint/test/e2e
- local setup documentation
- top-level README

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/repo/ci-readiness.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

Finalize:
- root scripts and turbo tasks
- basic CI workflow for lint, typecheck, unit/integration, and Playwright
- updated local-development guide
- README describing repo purpose and boot process

**Step 4: Run test to verify it passes**

Run:
- `npm exec vitest run tests/repo/ci-readiness.test.ts`
- `npm exec vitest run`
- `npm exec playwright test`

Expected: PASS.

**Step 5: Commit**

```bash
git add package.json turbo.json .github/workflows/ci.yml docs/local-development.md README.md tests/repo/ci-readiness.test.ts
git commit -m "chore: finalize repo readiness and CI"
```

## Execution Notes
- Use `@superpowers/executing-plans` to implement this plan.
- Keep milestones vertically integrated; do not jump to uploads or workers before the web-only submitted-expense slice is working.
- Keep tenant scoping explicit in every persistence path from the first schema iteration onward.
- Do not collapse BullMQ worker code into the Next.js runtime.
- Do not store receipt file blobs in Postgres.
- Keep TDD discipline per task: failing test first, verify red, minimal code, verify green.

## Suggested Milestone Checkpoints
- After Task 4: auth plus self-serve tenant creation is working
- After Task 6: first submitted-expense slice is working
- After Task 8: budgets are required and linked correctly
- After Task 9: approvals are working
- After Task 11: async upload-to-draft flow is working
- After Task 12: repo is ready for broader development
