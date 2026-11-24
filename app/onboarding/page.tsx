import type { Metadata } from "next";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Business details",
  description: "Tell Veriq about your business so we can review and approve your account.",
};

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
      <OnboardingForm />
    </div>
  );
}