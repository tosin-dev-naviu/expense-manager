import Link from "next/link";

import { db } from "@expense-manager/db";

import { requireViewerMembership } from "../../../auth/session";
import { Card } from "../../../components/ui/card";
import { StatusBadge } from "../../../components/ui/status-badge";

export default async function DashboardPage() {
  const viewer = await requireViewerMembership();
  const drafts = await db.expense.findMany({
    where: {
      createdByUserId: viewer.userId,
      status: "draft",
      tenantId: viewer.tenantId,
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="page-stack">
      <Card className="hero-card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Your protected workspace is ready. Start a draft and keep edits flowing here.
          </p>
        </div>

        <Link className="button button--primary" href="/expenses/new">
          Create draft expense
        </Link>
      </Card>

      <Card>
        <div className="section-heading">
          <div>
            <h2>Recent drafts</h2>
            <p className="muted">Your latest in-progress expenses appear here.</p>
          </div>
        </div>

        {drafts.length === 0 ? (
          <div className="empty-state">
            <p>No drafts yet.</p>
            <p className="muted">Create your first draft expense to seed the workflow.</p>
          </div>
        ) : (
          <div className="draft-list">
            {drafts.map((draft) => (
              <Link
                className="draft-row"
                href={`/expenses/new?draft=${draft.id}`}
                key={draft.id}
              >
                <div>
                  <p className="draft-row__title">{draft.merchantName ?? "Untitled draft"}</p>
                  <p className="draft-row__meta">{draft.description ?? "No description yet"}</p>
                </div>
                <StatusBadge status="draft" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
