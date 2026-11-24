/*
  SAMPLE DATA ONLY. Replace these helpers with real database queries
  for the signed-in company. Keep the same shapes so the pages keep working.

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

const codes: Code[] = [
  { code: "VR8K29PX", product: "Pure Spring Water 75cl", batch: "Nov 2026", createdAt: "2026-11-20T10:00:00Z", copied: false, verifiedCount: 0 },
  { code: "AB7M42QX", product: "Pure Spring Water 75cl", batch: "Nov 2026", createdAt: "2026-11-20T10:00:00Z", copied: true, verifiedCount: 1, lastVerifiedAt: "2026-11-23T16:40:00Z" },
  { code: "KD9P31LA", product: "Pure Spring Water 75cl", batch: "Nov 2026", createdAt: "2026-11-20T10:00:00Z", copied: true, verifiedCount: 0 },
  { code: "MN4T8WZC", product: "Orange Juice 1L", batch: "Nov 2026", createdAt: "2026-11-21T09:15:00Z", copied: false, verifiedCount: 0 },
  { code: "ZQ2H6RYD", product: "Orange Juice 1L", batch: "Nov 2026", createdAt: "2026-11-21T09:15:00Z", copied: false, verifiedCount: 3, lastVerifiedAt: "2026-11-24T08:05:00Z" },
  { code: "XF5J7GBE", product: "Orange Juice 1L", batch: "Nov 2026", createdAt: "2026-11-21T09:15:00Z", copied: true, verifiedCount: 0 },
];

export async function getCompany() {
  return { name: "Greenfield Beverages Ltd" };
}

export async function getCodes(): Promise<Code[]> {
  return codes;
}

export async function getStats() {
  const all = await getCodes();
  const used = all.filter((c) => c.verifiedCount > 0).length;
  return {
    total: all.length,
    used,
    unused: all.length - used,
    copied: all.filter((c) => c.copied).length,
  };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}