import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { formatDate, getApplication, statusLabels, statusStyles } from "../../data";
import { ReviewActions } from "./review-actions";

export const metadata: Metadata = {
  title: "Review application",
};

async function Review({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const app = await getApplication(id);
  if (!app) notFound();

  const details: { label: string; value: string }[] = [
    { label: "Business name", value: app.businessName },
    { label: "Address", value: app.address },
    { label: "Product category", value: app.category },
    { label: "Email", value: app.email },
    { label: "Phone", value: app.phone },
    { label: "Website", value: app.website ?? "Not provided" },
    { label: "Submitted", value: formatDate(app.submittedAt) },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href={`/admin?status=${app.status}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All applications
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {app.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.logoUrl} alt="" className="size-14 rounded-md border border-line bg-white object-contain" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-md bg-ink font-serif text-xl font-semibold text-white"
          >
            {app.businessName.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{app.businessName}</h1>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[app.status]}`}>
            {statusLabels[app.status]}
          </span>
        </div>
      </div>

      <section className="mt-10 border-t-2 border-ink pt-5">
        <h2 className="font-serif text-xl font-semibold">Business information</h2>
        <dl className="mt-4 divide-y divide-line rounded-lg border border-line bg-white">
          {details.map(({ label, value }) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 border-t-2 border-ink pt-5">
        <h2 className="font-serif text-xl font-semibold">Verification documents</h2>
        <ul className="mt-4 space-y-2">
          {app.documents.map((doc) => (
            <li key={doc.name} className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-3">
              <FileText className="size-5 shrink-0 text-brand" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{doc.name}</span>
              <span className="shrink-0 text-sm text-muted">{doc.size}</span>
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-semibold text-brand underline underline-offset-4"
              >
                Open
                <span className="sr-only"> {doc.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t-2 border-ink pt-5">
        <h2 className="font-serif text-xl font-semibold">Decision</h2>
        {app.status === "pending" && <ReviewActions id={app.id} businessName={app.businessName} />}
        {app.status === "approved" && (
          <p className="mt-4 rounded-md border-l-4 border-seal bg-seal-soft p-4 text-sm">
            This company is approved and can use its dashboard.
          </p>
        )}
        {app.status === "rejected" && (
          <div className="mt-4 rounded-md border-l-4 border-danger bg-danger-soft p-4 text-sm">
            <p className="font-semibold text-danger">Rejected</p>
            {app.rejectionReason && <p className="mt-1">{app.rejectionReason}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="mx-auto w-full max-w-3xl px-5 py-14 text-muted sm:px-8">Loading application</p>}
    >
      <Review params={params} />
    </Suspense>
  );
}