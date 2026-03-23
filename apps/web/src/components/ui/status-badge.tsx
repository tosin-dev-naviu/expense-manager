export function StatusBadge({ status }: { status: "draft" | "saved" | "updated" }) {
  const label =
    status === "draft"
      ? "Draft"
      : status === "saved"
        ? "Draft saved"
        : "Draft updated";

  return <span className="status-badge">{label}</span>;
}
