# Product Requirements Document

## Product
Multi-Tenant Spend Management MVP With AI Receipt Intake

## Status
Draft v1

## Source Context
This PRD is grounded in the supplied Figma designs for:
- Expense Requests
- Team Budgets
- Add Budget modal

It also incorporates the agreed product additions that are not explicitly shown in the current designs:
- Homepage action hub
- Upload an expense
- Manual expense creation
- AI-assisted receipt-to-expense draft flow

## Summary
This product is a multi-tenant spend management SaaS for organizations that need structured control over team budgets and employee expense submissions. The MVP combines three core workflows:
- A homepage action hub for fast entry into common tasks
- An expense workflow that supports upload, manual creation, review, approval, rejection, export, and team-level visibility
- A budget workflow that lets organizations create and monitor team budgets inside each tenant workspace

Each tenant represents a separate organization with isolated users, teams, budgets, receipts, expenses, and permissions.

## Problem Statement
Organizations often manage team spending with spreadsheets, email threads, chat messages, and manual reimbursement processes. That creates slow approvals, poor visibility into budget utilization, and inconsistent expense records. Users also spend too much time manually entering receipt details.

The product should give each organization a shared workspace where teams can upload receipts, convert them into expenses with AI assistance, submit expenses against team budgets, and manage budget utilization in one place.

## Goals
- Reduce time required to capture and submit an expense
- Give teams one shared system of record for expenses and budget usage
- Make budget visibility clear at both workspace and team level
- Let managers and admins review and act on team expenses without leaving the product
- Use AI to reduce manual data entry from receipt uploads

## Non-Goals
- Advanced reporting and analytics beyond the current list and summary views
- Multi-step or configurable approval routing
- Expense categories and policy engines
- Duplicate receipt detection
- Cross-tenant administration
- Detailed accounting integrations
- Full technical architecture or implementation design

## Product Principles
- Keep the MVP workflow-first rather than analytics-first
- Make upload and submit fast for end users
- Keep every expense tied to a team budget
- Preserve clear tenant isolation
- Use AI to assist, not replace, user confirmation

## Users and Roles

### Tenant Admin / Finance Ops Admin
Primary workspace operator for a tenant.

Responsibilities:
- Oversee spend activity across the tenant
- View budgets and expenses across teams
- Approve or reject expenses
- Create budgets
- Export expense data

### Department Manager
Team-scoped operator.

Responsibilities:
- View only their own team's budgets and expenses
- Create budgets for their team
- Approve or reject expenses for their team
- Monitor over-budget activity for their team

### Employee
Expense submitter and team participant.

Responsibilities:
- Upload receipts
- Create expenses manually
- Review and edit AI-created drafts
- Submit expenses
- View the shared expense list for their team
- Export expense data if they have access to the list

## Multi-Tenant Model
- Each tenant is a separate organization workspace.
- All budgets, receipts, expenses, exports, users, and teams are tenant-scoped.
- Data from one tenant must never be visible in another tenant.
- Manager visibility is constrained to the manager's assigned team.
- Employee visibility is constrained to the employee's tenant and team-level expense list.

## Core Entities

### Tenant
- Organization name
- Workspace identity
- Users
- Teams

### Team
- Team name
- Team manager
- Linked budget or budgets

### Budget
- Budget name
- Amount
- Assigned team
- Current spend
- Remaining amount
- Utilization percentage
- Tenant ownership

### Receipt Upload
- Uploaded file
- File type
- Uploading user
- Team context
- Tenant ownership
- Extraction state

### Expense Draft
- Merchant or description
- Amount
- Date
- Receipt attachment when present
- Linked team and budget
- Draft status
- Editable extracted values

### Expense Request
- Employee name
- Employee email
- Description
- Amount
- Date
- Linked team budget
- Status
- Receipt attachment when present
- Tenant ownership

## Status Model
MVP expense statuses:
- Draft
- Pending
- Approved
- Rejected

Status expectations:
- `Draft` is editable and not yet submitted
- `Pending` is submitted and awaiting decision
- `Approved` is accepted by an authorized manager or admin
- `Rejected` is declined by an authorized manager or admin

## MVP Workflows

### 1. Homepage Action Hub
The homepage should act as a task-oriented landing page rather than a passive KPI summary.

Required homepage capabilities:
- Primary CTA: `Upload an expense`
- Quick action: `Add budget`
- Entry point for manual expense creation
- Recent drafts/uploads module so users can resume incomplete submissions
- Relevant recent work and shortcuts into the expense workflow

Homepage intent:
- Help users start important tasks immediately
- Reduce time to first action
- Surface incomplete work that needs attention

### 2. AI Receipt Intake
Users can upload a receipt and let AI prefill an expense draft.

Requirements:
- Accept image uploads
- Accept PDF uploads
- One uploaded receipt maps to one expense draft in MVP
- AI extracts likely fields, including:
  - merchant or description
  - amount
  - date
- The system creates an editable draft expense from the extracted data
- Users can edit every extracted field before submission
- The upload flow does not auto-submit the expense

MVP exclusions:
- No duplicate receipt detection
- No receipt splitting into multiple expenses
- No autonomous submission without review

### 3. Manual Expense Creation
Users can create an expense without uploading a receipt.

Requirements:
- Manual creation must enter the same draft workflow as AI-generated expenses
- Users can add or edit the same core fields as in AI-generated drafts
- The product should not require a receipt upload in order to create a draft
- Receipt attachment remains optional for manually created expenses

### 4. Expense Submission and Review
Draft expenses become submitted expense requests after validation.

Required fields before submission:
- Amount
- Merchant or description
- Date
- Team or budget association

Submission rules:
- Every submitted expense must be linked to a team budget
- Submitted expenses appear in the shared team-level expense list
- The same team-level list supports employees, managers, and admins with role-appropriate visibility
- Over-budget expenses are allowed to proceed, but must be visibly flagged with a warning

Approval rules:
- Admins can approve or reject expenses
- Team managers can approve or reject expenses for their own teams
- Approval is single-step in MVP

### 5. Expense Requests Workspace
The expense list is the core operational workspace for submitted expenses.

Required capabilities:
- Search
- Status tabs
- Row-level actions
- Export
- Pagination
- Team-level visibility model

Behavior notes:
- Employees can view team-level submitted expenses within their team
- Managers can only view expenses for their own team
- Admins can view broader tenant expense activity
- Any user who can access the list can export its data

### 6. Team Budget Management
The budget workflow lets admins and managers create and monitor budgets.

Required budget overview content:
- Total budget
- Total spent
- Remaining amount
- Average utilization
- Per-team budget cards

Budget card expectations:
- Team name
- Current spend
- Total budget amount
- Utilization percentage
- Visual progress indicator

Creation requirements:
- Budget creation is allowed for admins and managers
- Add Budget uses:
  - budget name
  - amount
  - team selection

Visibility rules:
- Managers can view only their own team's budgets
- Admins can view tenant-wide budget data

## Functional Requirements

### Homepage
- The homepage must be positioned as an action hub.
- The homepage must include `Upload an expense` as a primary CTA.
- The homepage must include a way to start manual expense creation.
- The homepage must include recent drafts/uploads.
- The homepage should link users into the expense and budget workflows with minimal friction.

### Receipts and AI
- The system must accept image and PDF receipt uploads.
- The system must create one expense draft per uploaded receipt.
- The system must use AI to prefill draft fields from receipt content.
- The user must be able to edit all AI-extracted fields.
- The product must treat AI extraction as assistive, not final.

### Expense Drafts and Submission
- Users must be able to create drafts from upload or manual entry.
- Drafts must support edit-before-submit behavior.
- Receipt attachment is optional at submission time.
- Submission must require amount, merchant or description, date, and team/budget association.
- Each submitted expense must be associated with a team budget.
- Submitted expenses must move into `Pending`.

### Expense Review
- Pending expenses must support `Approve` and `Reject`.
- The product must show status clearly in the request list.
- Over-budget expenses must display a visible warning state.

### Budgets
- The product must support team budget creation.
- The product must support budget overview metrics and per-team cards.
- The product must support team selection when creating a budget.

### Permissions and Visibility
- The product must enforce tenant isolation.
- Managers must be limited to their own team's budgets and expenses.
- Employees must be able to view the team-level expense list for their team.
- Admins must have broader oversight inside their tenant.
- Users with list access must be able to export list data.

## Platform and Product Constraints
- The product must be multi-tenant.
- Tenant data isolation is a hard product requirement.
- AI receipt extraction is a product capability, but model choice and technical implementation are outside this PRD.
- The PRD should stay product-focused and avoid detailed engineering architecture.

## Success Metrics
- Time to create and submit an expense draft
- Percentage of uploaded receipts converted into submitted expenses
- Time to approve or reject a pending expense
- Percentage of expenses linked to a valid team budget
- Budget visibility coverage across teams in a tenant
- Usage of homepage quick actions, especially `Upload an expense`

## Risks and Open Product Considerations
- Team-level visibility for employees may expose spend details some tenants later want restricted
- Optional receipt handling may reduce supporting documentation quality for some expenses
- Over-budget approval behavior may need stronger controls in later versions
- Export access for all list viewers may need to become configurable in future releases

## Acceptance Scenarios
- A user uploads a PDF receipt and receives one editable expense draft
- A user uploads an image receipt and receives one editable expense draft
- A user creates an expense manually without first uploading a receipt
- A user edits AI-extracted fields before submitting
- A draft cannot be submitted unless amount, merchant or description, date, and team/budget association are present
- A submitted expense is linked to a team budget and appears in the team-level expense list
- A manager can view only their own team's expenses and budgets
- An employee can view the team-level expense list for their team
- A manager can approve or reject an expense for their team
- An admin can approve or reject an expense
- An over-budget expense can still be submitted and approved, but is visibly flagged
- A user with list access can export expense list data
- Data from one tenant is not visible to another tenant

## Out of Scope for MVP
- Expense categories
- Duplicate receipt detection
- Configurable approval routing
- Multi-step approvals
- Advanced reporting
- Cross-tenant admin views
- Detailed technical architecture
- Accounting integrations

## Notes For Design and Engineering Follow-Up
- The current design set already supports Expense Requests, Team Budgets, and Add Budget.
- The homepage action hub, manual expense creation entry point, and AI receipt upload flow need additional design coverage if this PRD moves into product design or implementation.
- Future follow-up docs should define edge cases for rejected expenses, missing receipts, export format, and team assignment behavior.
