import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/session";
import {
  formatDate,
  getApplications,
  statusLabels,
  statusStyles,
  type ApplicationStatus,
} from "./data";

export const metadata: Metadata = {
  title: "Applications",
};

const tabs: ApplicationStatus[] = ["pending", "approved", "rejected"];

async function ApplicationsList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: ApplicationStatus = tabs.includes(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : "pending";

  await requireAdmin();
  const all = await getApplications();
  const counts = Object.fromEntries(
    tabs.map((t) => [t, all.filter((a) => a.status === t).length]),
  ) as Record<ApplicationStatus, number>;
  const rows = all
    .filter((a) => a.status === active)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <>
      <nav aria-label="Application status" className="mt-8 flex gap-1 border-b border-line">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <Link
              key={tab}
              href={`/admin?status=${tab}`}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-brand text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {statusLabels[tab]}
              <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-xs text-muted ring-1 ring-line">
                {counts[tab]}
              </span>
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-line bg-white p-8 text-center text-muted">
          {active === "pending"
            ? "No applications are waiting for review."
            : `No ${statusLabels[active].toLowerCase()} companies yet.`}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-paper text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Company</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{app.businessName}</p>
                    <p className="text-muted">{app.email}</p>
                  </td>
                  <td className="px-4 py-4 text-muted">{app.category}</td>
                  <td className="px-4 py-4 text-muted">{formatDate(app.submittedAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="font-semibold text-brand underline underline-offset-4"
                    >
                      {app.status === "pending" ? "Review" : "View"}
                      <span className="sr-only"> {app.businessName}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Company applications
      </h1>
      <p className="mt-2 text-muted">Review new companies and decide who can use Veriq.</p>

      <Suspense fallback={<p className="mt-8 text-muted">Loading applications</p>}>
        <ApplicationsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}