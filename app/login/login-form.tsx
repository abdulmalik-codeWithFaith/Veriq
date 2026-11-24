"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type AccountStatus = "admin" | "approved" | "pending" | "rejected";

/*
  TODO: replace with your real login call.
  It should return the account's role/status so we know where to send the person:
  admin -> /admin, approved -> /dashboard, pending -> /pending, rejected -> /rejected.
*/
async function logIn(email: string, password: string): Promise<AccountStatus> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (!email || !password) throw new Error("invalid");
  return "pending";
}

const destinations: Record<AccountStatus, string> = {
  admin: "/admin",
  approved: "/dashboard",
  pending: "/pending",
  rejected: "/rejected",
};

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
      const status = await logIn(email.trim(), password);
      router.push(destinations[status]);
    } catch {
      setError("The email or password is wrong. Check them and try again.");
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