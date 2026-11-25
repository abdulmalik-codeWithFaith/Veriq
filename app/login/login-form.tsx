"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

async function logIn(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  await signOut(auth); // our secure cookie is the real session
  if (!res.ok) {
    const info = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    throw new Error(`session ${res.status}: ${info.error ?? "unknown"} ${info.detail ?? ""}`.trim());
  }
  // The server decides where this person belongs: admin, dashboard, pending, rejected or onboarding.
  const data = (await res.json()) as { destination: string };
  return data.destination;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const destination = await logIn(email.trim(), password);
      router.push(destination);
    } catch (err) {
      console.error("Login failed:", err);
      const code = (err as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("No internet connection. Check it and try again.");
      } else if (err instanceof Error && err.message.startsWith("session ") && process.env.NODE_ENV === "development") {
        // Only while developing: the account is fine, but our server step failed.
        setError(`Setup problem (only shown while developing): ${err.message}`);
      } else {
        setError("The email or password is wrong. Check them and try again.");
      }
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-md border bg-white px-4 text-base " +
    (error ? "border-danger" : "border-line");

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="text-sm font-semibold">
          Business email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-2 ${inputClass}`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-2">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-muted hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        {submitting ? "Logging in" : "Log in"}
      </button>
    </form>
  );
}