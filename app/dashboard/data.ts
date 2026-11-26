/*
  Types and small helpers shared by the dashboard screens.
  The real data comes from lib/codes.ts (server only).

  Three things are tracked separately on every code:
    - it exists (generated)
    - copied: the company copied it (flag only; never blocks verification)
    - verifiedCount: how many times a customer verified it
  Copying a code never counts as a customer using it.
*/

export type Code = {
  code: string;
  product: string;
  batch: string;
  createdAt: string; // ISO date
  copied: boolean;
  verifiedCount: number;
  lastVerifiedAt?: string; // ISO date
};

export type CodeStatus = "unused" | "copied" | "used";

export function codeStatus(c: Code): CodeStatus {
  if (c.verifiedCount > 0) return "used";
  return c.copied ? "copied" : "unused";
}

export const statusLabels: Record<CodeStatus, string> = {
  unused: "Unused",
  copied: "Copied",
  used: "Used",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}