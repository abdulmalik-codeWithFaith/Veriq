import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Veriq account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-12 sm:py-20">
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        Log in
      </h1>
      <p className="mt-3 text-base text-muted">
        New to Veriq?{" "}
        <Link href="/signup" className="font-semibold text-brand underline underline-offset-4">
          Create an account
        </Link>
      </p>

      <LoginForm />

      <p className="mt-8 rounded-md border border-line bg-white p-4 text-sm leading-relaxed text-muted">
        Just checking a product? You don’t need an account.{" "}
        <Link href="/verify" className="font-semibold text-brand underline underline-offset-4">
          Verify a product
        </Link>
      </p>
    </div>
  );
}