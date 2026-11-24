import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Register your company on Veriq and start protecting your products.",
};

const nextSteps = [
  {
    title: "Create your account",
    body: "Your name, business email and a password. This takes a minute.",
  },
  {
    title: "Tell us about your business",
    body: "Add your business name, address, logo, product category and verification documents.",
  },
  {
    title: "Wait for approval",
    body: "We review your application and email you. Your dashboard opens once you’re approved.",
  },
];

export default function SignupPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-20">
      {/* What happens next */}
      <aside className="order-last rounded-xl bg-ink p-7 text-white sm:p-9 lg:order-first lg:self-start">
        <h2 className="font-serif text-2xl font-semibold">What happens next</h2>
        <ol className="mt-6 space-y-6">
          {nextSteps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/40 text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>

      {/* Form */}
      <section>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-3 text-base text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand underline underline-offset-4">
            Log in
          </Link>
        </p>
        <SignupForm />
      </section>
    </div>
  );
}