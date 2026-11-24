import { statusLabels, type CodeStatus } from "./data";

const styles: Record<CodeStatus, string> = {
  unused: "bg-paper text-muted ring-1 ring-line",
  copied: "bg-[#e6eef8] text-brand",
  used: "bg-seal-soft text-seal",
};

export function StatusBadge({ status }: { status: CodeStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}