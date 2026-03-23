# Technical Architecture Specification

## Product
Multi-Tenant Spend Management MVP With AI Receipt Intake

## Status
Draft v1

## Purpose
This document defines the technical architecture for the v1 product described in the PRD. It is written for future implementation by Codex and should be treated as the authoritative technical reference for system boundaries, repository layout, runtime flows, persistence strategy, async job handling, deployment topology, and testing strategy.

This is an implementation-oriented architecture spec, not a task-by-task build plan.

## Scope and Approach
The system is a web-first, multi-tenant SaaS application built in a single monorepo. The architecture is optimized for:
- rapid implementation of the v1 workflows
- clear tenant isolation rules
- low-friction sharing of code across web and worker runtimes
- safe handling of async receipt extraction
- simple local development and containerized production deployment

## Locked Technology Decisions
- Monorepo: `pnpm` workspaces with `Turborepo`
- Frontend and primary backend: `Next.js`
- Authentication: `Auth.js` with credentials-based email/password
- Session strategy: `Auth.js` database sessions
- Database: `PostgreSQL`
- ORM: `Prisma`
- Queue and workers: `BullMQ` with `Redis`
- File storage: `S3-compatible object storage`
- Local object storage service: `MinIO`
- Email delivery: `SMTP-compatible`
- Local email service: `MailHog`
- AI extraction: `OpenAI`
- Local development orchestration: `Docker Compose`
- Production hosting: `Scaleway`
- End-to-end testing: `Playwright`

## Monorepo Structure
The monorepo should use a small number of explicit application boundaries plus shared packages.

### Applications

#### `apps/web`
Primary Next.js application.

Responsibilities:
- public marketing or auth-facing pages if needed in v1
- authenticated product UI
- server components and client components
- server actions for most authenticated writes
- route handlers for upload preparation and machine-facing endpoints
- Auth.js session and sign-in flows
- tenant-aware business logic orchestration

#### `apps/worker`
Separate Node.js worker service in the same monorepo.

Responsibilities:
- BullMQ consumer runtime
- processing long-running or retryable jobs
- receipt extraction with OpenAI
- writing draft expense payloads after extraction
- job retry, failure recording, and partial-result handling

This is a separate process and separate deployable service, but not a separate repository.

### Shared Packages

#### `packages/db`
Responsibilities:
- Prisma schema
- generated Prisma client
- shared repository helpers for tenant-scoped reads and writes
- migration ownership

#### `packages/auth`
Responsibilities:
- Auth.js configuration
- role and session helpers
- membership and authorization utilities

#### `packages/validation`
Responsibilities:
- shared schemas for server actions, route handlers, and worker payloads
- input/output validation for uploads, draft creation, and expense submission

#### `packages/queue`
Responsibilities:
- queue names
- job payload types
- queue producers
- queue utility helpers shared between web and worker

#### `packages/domain`
Responsibilities:
- shared domain types
- status enums
- non-UI business constants

### Recommended Root Files
- `pnpm-workspace.yaml`
- `turbo.json`
- root `package.json`
- `.env.example`
- `docker-compose.yml`
- `Dockerfile.web`
- `Dockerfile.worker`

## Runtime Architecture
The system separates synchronous user-facing flows from asynchronous ingestion work.

### Synchronous Flows
Handled by `apps/web`.

Examples:
- sign up and tenant creation
- invite acceptance
- manual draft creation
- draft editing
- expense submission
- approval and rejection
- budget creation
- dashboard and list reads
- upload session creation

### Asynchronous Flows
Handled by `apps/worker`.

Examples:
- receipt extraction
- retry of failed extraction attempts
- normalized draft payload generation

### Why The Split Exists
Next.js is well suited to authenticated request/response work. Receipt parsing is long-running, retryable, and resource-sensitive. BullMQ workers should not share the same runtime process as the main Next.js server. This split avoids operational fragility while preserving one codebase.

## Backend Interface Strategy
The product is `web-first`, not `API-first`.

### Server Actions
Server actions should be the default write path for authenticated UI-originated mutations, including:
- create manual draft
- update draft fields
- submit expense
- approve expense
- reject expense
- create budget
- invite user

Reasons:
- best fit with the Next.js app model
- reduced API boilerplate for app-internal workflows
- easier co-location with form-driven UI
- cleaner enforcement of shared tenant-scoped repository helpers

### Route Handlers
Route handlers should be used only where server actions are not a clean fit, including:
- issuing presigned upload URLs
- receiving upload completion callbacks if used
- machine-facing endpoints
- health endpoints if needed

The architecture should avoid designing a broad public API in v1.

### Data Access Enforcement
Tenant-scoped access should be centralized in shared repository or query helpers rather than scattered raw ORM calls across pages, server actions, route handlers, and worker code.

Required behavior:
- authenticated application code resolves the active tenant membership context before data access
- tenant-owned queries always flow through helpers that require `tenant_id`
- authorization evaluates tenant access before role or team-scope rules
- workers apply the same tenant-scoping rules when loading or mutating tenant-owned records
- pages, server actions, route handlers, and workers must not bypass these repository helpers for tenant-owned reads or writes

This is an implementation constraint, not an optional code-organization preference.

## Authentication and Authorization

### Auth Model
Use `Auth.js` with credentials-based email/password authentication and invite flow support.

Session strategy:
- use database-backed sessions for v1
- do not use JWT sessions in the MVP

Why:
- membership revocation and invite-state changes should take effect without waiting for long-lived tokens to expire
- tenant-aware session resolution is simpler when session state can be checked against the database

Supported flows:
- user sign-up
- sign-in
- sign-out
- invited user acceptance
- tenant-aware session creation

### Tenant Onboarding
v1 uses self-serve tenant creation.

Flow:
1. New user signs up.
2. User creates a new organization/workspace.
3. System creates a tenant record.
4. System creates the initial membership for that user as `tenant_admin`.

There is no separate platform-admin control plane in v1.

### Roles
- `tenant_admin`
- `manager`
- `employee`

### Membership Model
Users and tenants relate through memberships rather than a single user-to-tenant foreign key. This keeps invite handling and potential future multi-tenant membership expansion cleaner.

Expected membership fields:
- `user_id`
- `tenant_id`
- `role`
- `status`

Authenticated session resolution must expose:
- `user_id`
- active `membership_id`
- active `tenant_id`
- active `role`

The session should not be treated as authorization proof by itself. Authorization must still validate the relevant membership and tenant scope at request time.

### Invite Model
Invites are a first-class tenant-scoped record and must support in-product email delivery.

Expected invite fields:
- `tenant_id`
- target `email`
- `role`
- optional `team_id`
- invitation `token`
- `status`
- `expires_at`
- timestamps

Invite delivery rules:
- v1 sends invitation emails through a generic SMTP transport
- local development uses `MailHog`
- production email provider remains an SMTP-compatible configuration decision, not an application design decision

Invite acceptance rules:
- validate tenant, role, invite status, and expiration before membership activation
- ensure invite acceptance is single-use
- invalidate or mark the invite consumed immediately after successful acceptance

### Team-Scoped Access
Managers are scoped to one or more teams inside a tenant. Their access rules are narrower than tenant admins.

Required behavior:
- managers can read only their own teams' budgets and expenses
- managers can approve or reject expenses for their own teams
- employees can access the team-level expense views allowed by product rules within their tenant
- tenant admins can access tenant-wide resources

### Authorization Rule Shape
Authorization must always evaluate in two layers:
1. tenant access check
2. role and team-scope access check

Role checks must never replace tenant checks.

## Multi-Tenant Persistence Model

### Isolation Strategy
Use a single PostgreSQL database with a shared schema and explicit `tenant_id` on tenant-owned data.

This is the required MVP strategy.

### Why This Model
- simplest operational model for v1
- straightforward with Prisma
- avoids schema-per-tenant migration overhead
- keeps the system compatible with a future move to stronger isolation if needed

### Tenant-Owned Tables
At minimum, these records should be tenant-scoped:
- teams
- budgets
- expense requests
- draft expenses
- receipt uploads
- memberships
- invites

Where a table belongs to a tenant, it must carry `tenant_id` explicitly even if the relation could be inferred indirectly.

### Query Rule
Every read and write touching tenant-owned data must filter by `tenant_id`.

This must be enforced consistently in:
- server actions
- route handlers
- repository helpers
- worker consumers

## Core Data Model
This section defines the minimum entity relationships needed for v1. The actual Prisma schema can refine field names, but should not change these relationships without a new design decision.

### User
Represents a person who can authenticate.

Minimum attributes:
- identity fields
- auth credentials or provider linkage
- timestamps

### Tenant
Represents an organization workspace.

Minimum attributes:
- name
- slug or unique workspace identifier
- timestamps

### Membership
Links users to tenants and roles.

Minimum attributes:
- user reference
- tenant reference
- role
- invite or activation status

### Team
Represents a spend-owning team inside a tenant.

Minimum attributes:
- tenant reference
- name
- manager relationship or team assignment data

### Budget
Represents a budget record for a team and period/version.

Minimum attributes:
- tenant reference
- team reference
- name
- amount
- status if needed
- effective period or equivalent versioning fields

### Budget History Rule
Teams can have many budgets over time. The architecture must not model budget as a single mutable record per team only.

Expense records should reference a concrete `budget_id`, not only a `team_id`.

### Receipt Upload
Represents an uploaded object and its processing state.

Minimum attributes:
- tenant reference
- user reference
- object storage key
- content type
- file size if captured
- upload status
- extraction status

Upload metadata must be persisted before enqueuing extraction work so retries and user-visible status remain anchored to a durable record.

### Draft Expense
Represents a pre-submission expense payload.

Minimum attributes:
- tenant reference
- creator user reference
- team reference
- budget reference
- merchant or description
- amount
- date
- receipt upload reference if present
- extraction status
- draft status

### Expense Request
Represents a submitted expense.

Minimum attributes:
- tenant reference
- submitting user reference
- team reference
- budget reference
- status
- amount
- description
- date
- receipt upload reference if present
- approval metadata if present

### Job Metadata
Represents async processing state when needed for operability.

May be stored either:
- in BullMQ plus receipt upload state columns, or
- in a small persistent job-tracking table if later needed

v1 should avoid inventing a full workflow engine. Persist only enough job state to support debugging, retries, and user-visible extraction status.

## Receipt Upload Contract
Uploads should go directly from the browser to object storage.

### Flow
1. Authenticated user requests an upload session from the web app.
2. Web app validates tenant and user access.
3. Web app issues a presigned upload URL and object key.
4. Browser uploads the file directly to object storage.
5. Web app records upload metadata in Postgres.
6. Web app enqueues `receipt_extraction_job`.

### Why This Contract
- avoids routing large files through the Next.js server
- scales better for PDFs and images
- keeps application servers focused on orchestration

### Storage Rules
- object storage is the source of truth for receipt files
- Postgres stores metadata and associations, not file blobs
- uploads can exist without becoming submitted expenses immediately
- local development uses `MinIO` as the S3-compatible object storage service

## Background Job Architecture

### Queue System
BullMQ is the required queue implementation.

Redis is a required service in any environment that runs queues or workers.

### Initial Queue Set
At minimum:
- `receipt_extraction`

### Initial Job
`receipt_extraction_job`

Producer:
- `apps/web`

Consumer:
- `apps/worker`

Purpose:
- fetch uploaded image or PDF from object storage
- call OpenAI to extract likely expense fields
- normalize extraction results
- create or update a draft expense payload
- record extraction outcome

Required payload fields:
- `tenant_id`
- `receipt_upload_id`
- `created_by_user_id`

The payload must contain enough identity data to resolve the correct upload and enforce idempotent draft creation without relying on ambient runtime state.

The worker job payload must carry stable identifiers only. It must not embed mutable tenant-owned records or trust request-time objects passed from the web runtime.

### Expected Worker Behavior
- validate payload before processing
- reload tenant-scoped records from the database before mutating them
- fetch file using object storage metadata
- call OpenAI with file input
- extract merchant or description, amount, and date when possible
- persist a draft even when extraction is partial
- mark extraction status for user-facing completion flows

### Failure Handling
If extraction is partial or fails:
- do not discard the upload
- create a partial draft when enough context exists
- mark the draft as needing user completion
- preserve extraction failure details in internal logs or metadata

### Retry Model
BullMQ retry behavior should be used for transient failures such as:
- temporary OpenAI errors
- temporary object storage access issues
- temporary Redis or network issues

The worker should avoid unsafe duplicate side effects by making draft creation idempotent for a given receipt upload.

### Idempotency Expectation
There should be at most one active draft expense associated with a given receipt upload unless a future product decision changes this.

## Draft Creation Contract
The worker must output a normalized draft payload shape that the web app can render and edit.

Required semantic fields:
- `tenant_id`
- `created_by_user_id`
- `team_id` when known or later user-supplied
- `budget_id` when known or later user-supplied
- `merchant_or_description`
- `amount`
- `date`
- `receipt_upload_id`
- `extraction_status`

Extraction status should support at least:
- success
- partial
- failed

The UI should treat all AI-generated values as editable.

## Expense Submission Contract
Submission happens in `apps/web` through authenticated server actions.

Required checks before creating a submitted expense:
- authenticated user has tenant membership
- selected team and budget belong to the same tenant
- user is allowed to submit against that team context
- amount exists
- merchant or description exists
- date exists

Submission result:
- draft becomes or produces an expense request
- expense request references a concrete `budget_id`
- status becomes `pending`

## Budget Contract
Budgets are versioned records over time, not a single mutable team singleton.

Required rules:
- a team can have multiple budget records across periods or revisions
- expense requests reference one specific budget record
- budget summaries in the UI are derived from expense linkage, not guessed from team totals alone

This preserves historical accuracy when budgets change over time.

## Local Development Topology
Local development should be standardized with Docker Compose.

### Required Services
- `web`
- `worker`
- `postgres`
- `redis`
- `minio`
- `mailhog`

For local object storage, use `MinIO`.

For local email delivery and invite-flow inspection, use `MailHog`.

### Compose Goals
- one command to boot the full stack
- predictable environment variables
- shared network across services
- minimal divergence from production runtime shape

### Local Developer Workflow
1. start compose services
2. run Prisma migrations
3. start Next.js web app
4. start worker process
5. run Playwright and targeted tests against the stack

The exact command names can be decided during implementation, but the architecture should preserve this multi-service local shape.

## Deployment Architecture
Production should run as separate containerized services on Scaleway.

### Services
- web container for `apps/web`
- worker container for `apps/worker`
- managed PostgreSQL
- managed Redis
- S3-compatible object storage

### Deployment Rules
- web and worker deploy independently
- both share the same database and Redis instance
- both consume shared environment configuration where appropriate
- worker does not serve HTTP traffic unless required for health checks

### Why This Topology
- matches the runtime split between synchronous and asynchronous work
- keeps the web app responsive
- allows independent scaling of workers if ingestion volume grows

## Environment Configuration
The architecture doc should assume separate environment groups for:
- database connection
- auth secrets and session config
- SMTP configuration
- Redis connection
- object storage credentials and bucket settings
- OpenAI credentials
- application URLs and cookie/session config

Expected environment variables should cover at least:
- `DATABASE_URL`
- `AUTH_SECRET`
- Auth.js session configuration needed for database sessions
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `REDIS_URL`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`
- `OPENAI_API_KEY`
- `APP_URL`

Secrets must not be logged.

## Security Baseline
v1 assumes a reasonable security posture, not a compliance-heavy program.

Required security properties:
- tenant isolation enforced in application code and queries
- encrypted transit for external service communication
- minimized logging of receipt content and extracted sensitive fields
- restricted object storage access through presigned URLs or service credentials
- separation of auth checks from tenant checks

Deferred:
- advanced audit systems
- compliance-specific retention programs
- customer-managed keys
- enterprise tenant isolation models

## Testing Strategy

### Primary Confidence Layer
Use Playwright as the primary end-to-end testing layer.

Core user journeys that should be covered:
- self-serve tenant creation
- sign-in
- invited user joins correct tenant
- manual expense draft creation
- receipt upload flow
- AI extraction result handling in UI
- draft editing and submission
- manager approval and rejection
- budget creation
- team-scoped visibility behavior

### Secondary Coverage
Use light unit and integration tests for logic that is easier to validate outside E2E:
- authorization helpers
- tenant-scoping helpers
- upload contract validation
- queue producer and consumer payload validation
- extraction result normalization
- budget-linking rules

### What The Architecture Must Enable For Tests
- deterministic seeded tenant, team, and user fixtures
- testable local object storage
- isolated Redis and Postgres for local test runs
- worker runtime that can be exercised in development and CI

## Required Test Scenarios
- Self-serve tenant creation creates the first tenant admin correctly
- Invited user joins the correct tenant with the intended role
- Invite creation sends through the configured SMTP transport in development against `MailHog`
- Manager access is limited to their own team’s budgets and expenses
- Employee sees only their tenant/team-allowed views
- Browser uploads receipt directly to object storage using a presigned URL
- Upload completion enqueues `receipt_extraction_job`
- Worker creates a draft from a successful extraction
- Worker creates a partial draft when extraction is incomplete or fails partially
- Worker maintains at most one active draft for a given receipt upload
- Expense submission references a specific budget record
- Web and worker services can run locally with Postgres, Redis, `MinIO`, and `MailHog` in Docker Compose
- Playwright covers core auth, upload, draft review, submit, approve/reject, and budget flows

## Observability and Operations
v1 should include a lightweight operational baseline.

Recommended minimums:
- structured application logs
- worker logs with job identifiers
- visible extraction status in persisted records
- basic health checks for web and worker

The architecture does not require a full tracing or metrics platform in v1.

## Out of Scope and Deferred Decisions
- public API design
- mobile client support
- duplicate receipt detection
- compliance-heavy controls
- multi-step approvals
- advanced analytics and reporting pipelines
- schema-per-tenant or database-per-tenant isolation
- accounting integrations
- broad event-driven architecture beyond the BullMQ ingestion need

## Implementation Guidance For Future Codex Work
When implementation begins, Codex should preserve these boundaries:
- no BullMQ worker logic inside the Next.js server runtime
- no storage of receipt file blobs in Postgres
- no tenant-owned queries without explicit tenant scoping
- no budget linkage based only on team when a concrete budget record is required
- no broad public API surface unless product scope changes

## Relationship To The PRD
This architecture exists to support the PRD workflows:
- homepage action hub
- receipt upload and AI-generated draft expenses
- manual draft creation
- expense review and submission
- manager/admin approval
- team budget management

If a future implementation change conflicts with the PRD, the product document and this architecture doc should be reviewed together before code is written.
