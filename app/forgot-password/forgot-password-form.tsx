"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2, MailCheck } from "lucide-react";
import { clientAuth } from "@/lib/firebase/client";

async function sendReset(email: string) {
  try {
    // After resetting, Firebase offers a button back to our login page.
    await sendPasswordResetEmail(clientAuth(), email, { url: `${window.location.origin}/login` });
  } catch (err) {
    const code = (err as { code?: string }).code;
    // The site's address is not yet in Firebase's "Authorized domains". The email still works without the button.
    if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
      await sendPasswordResetEmail(clientAuth(), email);
      return;
    }
    throw err;
  }
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const clean = email.trim();
    if (!clean) return setError("Enter your email.");
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError("Enter a valid email, like name@company.com.");

    setBusy(true);
    try {
      await sendReset(clean);
      setSentTo(clean);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        // Same message as success, so nobody can use this page to find out who has an account.
        setSentTo(clean);
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("No internet connection. Check it and try again.");
      } else if (code === "auth/invalid-email") {
        setError("Enter a valid email, like name@company.com.");
      } else if (process.env.NODE_ENV === "development") {
        console.error("Password reset failed:", err);
        setError(`Setup problem (only shown while developing): ${code ?? String(err)}`);
      } else {
        setError("We couldn’t send the email. Try again in a moment.");
      }
    }
    setBusy(false);
  }

  if (sentTo) {
    return (
      <div role="status" className="mt-8 rounded-lg border-l-4 border-seal bg-seal-soft p-5">
        <div className="flex items-center gap-3">
          <MailCheck className="size-6 text-seal" aria-hidden="true" />
          <p className="font-semibold text-seal">Check your email</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          If an account exists for <strong>{sentTo}</strong>, we’ve sent a link to reset the password.
          It may take a few minutes. Look in your spam folder too.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Back to log in
          </Link>
          <button
            type="button"
            onClick={() => setSentTo("")}
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-brand"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-semibold">Email</label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
          className={`mt-2 h-12 w-full rounded-md border bg-white px-4 text-base ${error ? "border-danger" : "border-line"}`}
        />
        {error && (
          <p id="email-error" role="alert" className="mt-1.5 text-sm font-medium text-danger">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        {busy ? "Sending" : "Send reset link"}
      </button>
    </form>
  );
}