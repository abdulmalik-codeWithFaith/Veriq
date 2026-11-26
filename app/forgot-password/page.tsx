import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-12 sm:py-20">
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Reset your password
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Enter the email you signed up with. We’ll send you a link to choose a new password.
      </p>

      <ForgotPasswordForm />

      <p className="mt-8 text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}