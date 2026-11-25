import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { destinationFor, requireCompany } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Business details",
  description: "Tell Veriq about your business so we can review and approve your account.",
};

// Only signed-in companies that haven't sent the form yet (or were rejected) see the form.
async function Gate() {
  const session = await requireCompany();
  if (session.status !== "incomplete" && session.status !== "rejected") {
    redirect(destinationFor(session));
  }
  return <OnboardingForm />;
}

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Tell us about your business
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        We review every company before it can create codes. This keeps Veriq
        trusted by customers. You’ll get an email when your application is
        approved or if we need more information.
      </p>
      <Suspense fallback={<p className="mt-10 text-muted">Loading</p>}>
        <Gate />
      </Suspense>
    </div>
  );
}