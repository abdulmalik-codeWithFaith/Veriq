import type { Metadata } from "next";
import { requireApprovedCompany } from "@/lib/auth/session";
import { getCodes, getStats } from "@/lib/codes";
import { CodesTable } from "./codes-table";

export const metadata: Metadata = { title: "Codes" };

export default async function CodesPage() {
  const session = await requireApprovedCompany();
  const [codes, stats] = await Promise.all([getCodes(session.uid), getStats(session.uid)]);
  return (
    <>
      <h2 className="font-serif text-2xl font-semibold">Your codes</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Copying a code only marks it as copied. It stays valid, and customers can still verify it.
      </p>
      <CodesTable initialCodes={codes} total={stats.total} />
    </>
  );
}