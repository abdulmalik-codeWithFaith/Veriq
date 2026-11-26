import type { Metadata } from "next";
import Link from "next/link";
import { requireApprovedCompany } from "@/lib/auth/session";
import { getCodes, getStats } from "@/lib/codes";
import { codeStatus, formatDate } from "./data";
import { StatusBadge } from "./status-badge";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const session = await requireApprovedCompany();
  const [stats, recent] = await Promise.all([getStats(session.uid), getCodes(session.uid, 5)]);

  const items = [
    { label: "Codes generated", value: stats.total, note: "All codes you have created" },
    { label: "Codes used", value: stats.used, note: "Checked by a customer" },
    { label: "Codes unused", value: stats.unused, note: "Not checked by anyone yet" },
    { label: "Codes copied", value: stats.copied, note: "Marked as copied by you" },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-white p-5">
            <dt className="text-sm font-semibold text-muted">{item.label}</dt>
            <dd className="mt-2 font-serif text-4xl font-semibold tabular-nums">
              {item.value.toLocaleString("en-GB")}
            </dd>
            <p className="mt-1 text-xs text-muted">{item.note}</p>
          </div>
        ))}
      </dl>

      {stats.total === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <p className="font-semibold">You haven’t created any codes yet.</p>
          <p className="mt-1 text-sm text-muted">Generate your first batch to start protecting your products.</p>
          <Link href="/dashboard/generate" className="mt-5 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
            Generate codes
          </Link>
        </div>
      ) : (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">Latest codes</h2>
            <div className="flex gap-3">
              <Link href="/dashboard/codes" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-brand">
                See all codes
              </Link>
              <Link href="/dashboard/generate" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                Generate codes
              </Link>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-white">
            {recent.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="font-mono text-sm font-semibold tracking-wider">{c.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{c.product}</span>
                <span className="text-sm text-muted">{formatDate(c.createdAt)}</span>
                <StatusBadge status={codeStatus(c)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}