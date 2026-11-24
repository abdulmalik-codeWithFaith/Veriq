import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MailCheck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Application under review",
};

const points = [
  {
    Icon: ShieldCheck,
    title: "We’re checking your details",
    body: "We review your business information and documents to keep Veriq trusted.",
  },
  {
    Icon: MailCheck,
    title: "You’ll get an email",
    body: "We’ll write to your business email when your application is approved, or if we need more information.",
  },
];

export default function PendingPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-14 sm:py-20">
      <span className="grid size-14 place-items-center rounded-full bg-amber-soft text-amber">
        <Clock className="size-7" aria-hidden="true" />
      </span>

      <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Your application is under review
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Thank you for applying. Your dashboard will open as soon as we approve
        your company. You don’t need to do anything else right now.
      </p>

      <ul className="mt-10 space-y-6 border-t-2 border-ink pt-6">
        {points.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <Icon className="mt-0.5 size-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-md bg-brand px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Back to home
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-line bg-white px-6 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-brand"
        >
          Log in again later
        </Link>
      </div>
    </div>
  );
}