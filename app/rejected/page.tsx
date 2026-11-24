import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Application not approved",
};

/* TODO: replace both values with real data. The reason comes from the admin's review. */
const SUPPORT_EMAIL = "support@yourdomain.com";
const reason: string | null =
  "Sample reason: the business registration document was unclear. Upload a clear copy and apply again.";

export default function RejectedPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-14 sm:py-20">
      <span className="grid size-14 place-items-center rounded-full bg-danger-soft text-danger">
        <XCircle className="size-7" aria-hidden="true" />
      </span>

      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        We couldn’t approve your application
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Your dashboard stays locked for now. You can fix the problem and send
        your application again.
      </p>

      {reason && (
        <div className="mt-8 rounded-lg border-l-4 border-danger bg-danger-soft p-4">
          <h2 className="font-semibold text-danger">Reason from our review</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink">{reason}</p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/onboarding"
          className="rounded-md bg-brand px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Update and apply again
        </Link>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="rounded-md border border-line bg-white px-6 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-brand"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}