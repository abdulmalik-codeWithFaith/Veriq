import type { ReactNode } from "react";

/*
  FILL THESE IN before you launch. They show on the Terms and Privacy pages exactly as written,
  so anything left in [brackets] will be visible to visitors.
*/
export const LEGAL = {
  name: "[YOUR LEGAL NAME OR COMPANY NAME]",
  email: "[YOUR CONTACT EMAIL]",
  address: "[YOUR ADDRESS, NIGERIA]",
  updated: "26 November 2026",
};

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LEGAL.updated}</p>
      <div className="mt-10 space-y-9">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}