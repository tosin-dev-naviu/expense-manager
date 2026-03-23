import { db } from "@expense-manager/db";
import { redirect } from "next/navigation";

import {
  createDraftExpenseAction,
  updateDraftExpenseAction,
} from "../../../actions/create-draft-expense";
import { requireViewerMembership } from "../../../../auth/session";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { isNextRedirectError } from "../../../../lib/is-next-redirect-error";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams?: Promise<{ draft?: string; saved?: string; updated?: string; error?: string }>;
}) {
  const viewer = await requireViewerMembership();
  const params = (await searchParams) ?? {};
  const draftRecord = params.draft
    ? await db.expense.findFirst({
        where: {
          createdByUserId: viewer.userId,
          id: params.draft,
          status: "draft",
          tenantId: viewer.tenantId,
        },
      })
    : null;
  const draft = draftRecord
    ? {
        id: draftRecord.id,
        merchantName: draftRecord.merchantName ?? "",
        amount: draftRecord.amount?.toString() ?? "",
        expenseDate: draftRecord.expenseDate?.toISOString().slice(0, 10) ?? "",
        description: draftRecord.description ?? "",
      }
    : null;

  return (
    <div className="page-stack">
      <Card className="hero-card hero-card--compact">
        <div>
          <p className="eyebrow">Manual draft</p>
          <h1>{draft ? "Edit expense draft" : "Create a draft expense"}</h1>
          <p className="muted">
            Capture the essentials now. Required submission checks come later in the workflow.
          </p>
        </div>
      </Card>

      <Card>
        <form
          action={async (formData) => {
            "use server";
            try {
              if (formData.get("draftExpenseId")) {
                const updated = await updateDraftExpenseAction(formData);
                redirect(`/expenses/new?draft=${updated.id}&updated=1`);
              }

              const created = await createDraftExpenseAction(formData);
              redirect(`/expenses/new?draft=${created.id}&saved=1`);
            } catch (error) {
              if (isNextRedirectError(error)) {
                throw error;
              }

              const message =
                error instanceof Error ? encodeURIComponent(error.message) : "Unknown+error";
              redirect(
                draft
                  ? `/expenses/new?draft=${draft.id}&error=${message}`
                  : `/expenses/new?error=${message}`,
              );
            }
          }}
          className="expense-form"
        >
          {draft ? <input name="draftExpenseId" type="hidden" value={draft.id} /> : null}

          <div className="expense-form__grid">
            <Input
              defaultValue={draft?.merchantName}
              label="Merchant"
              name="merchantName"
            />
            <Input
              defaultValue={draft?.amount}
              label="Amount"
              name="amount"
              placeholder="0.00"
            />
            <Input
              defaultValue={draft?.expenseDate}
              label="Expense date"
              name="expenseDate"
              type="date"
            />
            <Input
              defaultValue={draft?.description}
              label="Description"
              name="description"
            />
          </div>

          {params.error ? <p className="form-error">{params.error}</p> : null}
          {params.saved ? <p className="form-success">Draft saved</p> : null}
          {params.updated ? <p className="form-success">Draft updated</p> : null}

          <div className="expense-form__actions">
            <Button type="submit">{draft ? "Update draft" : "Save draft"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
