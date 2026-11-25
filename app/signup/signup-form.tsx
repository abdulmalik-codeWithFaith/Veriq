"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type Values = { name: string; email: string; password: string; terms: boolean };
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Enter your full name.";
  if (!v.email.trim()) errors.email = "Enter your business email.";
  else if (!/^\S+@\S+\.\S+$/.test(v.email.trim()))
    errors.email = "Enter a valid email, like name@company.com.";
  if (v.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!v.terms) errors.terms = "Accept the terms to continue.";
  return errors;
}

async function createAccount(values: Values): Promise<string> {
  const cred = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
  const idToken = await cred.user.getIdToken();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, name: values.name.trim() }),
  });
  await signOut(auth); // our secure cookie is the real session
  if (!res.ok) {
    const info = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    throw new Error(`session ${res.status}: ${info.error ?? "unknown"} ${info.detail ?? ""}`.trim());
  }
  const data = (await res.json()) as { destination: string };
  return data.destination;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-1.5 text-sm font-medium text-danger"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-md border bg-white px-4 text-base placeholder:text-muted/70";

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const destination = await createAccount(values);
      router.push(destination);
    } catch (err) {
      console.error("Signup failed:", err);
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists. Try logging in." });
        document.getElementById("email")?.focus();
      } else if (code === "auth/weak-password") {
        setErrors({ password: "Choose a stronger password." });
      } else if (code === "auth/network-request-failed") {
        setFormError("No internet connection. Check it and try again.");
      } else if (process.env.NODE_ENV === "development") {
        // Only while developing: show the real cause instead of a generic message.
        setFormError(`Setup problem (only shown while developing): ${code ?? (err instanceof Error ? err.message : String(err))}`);
      } else {
        setFormError("We couldn’t create your account. Try again.");
      }
      setSubmitting(false);
    }
  }

  const border = (key: keyof Values) =>
    errors[key] ? "border-danger" : "border-line";

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <Field id="name" label="Full name" error={errors.name}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`${inputClass} ${border("name")}`}
        />
      </Field>

      <Field id="email" label="Business email" error={errors.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${inputClass} ${border("email")}`}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        error={errors.password}
        hint="At least 8 characters."
      >
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${inputClass} ${border("password")} pr-12`}
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
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={values.terms}
            onChange={(e) => update("terms", e.target.checked)}
            aria-invalid={!!errors.terms}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            className="mt-1 size-5 shrink-0 accent-brand"
          />
          <span className="text-sm leading-relaxed text-muted">
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-brand underline underline-offset-4">
              terms of use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-brand underline underline-offset-4">
              privacy policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="terms-error" message={errors.terms} />
      </div>

      {formError && (
        <p role="alert" className="rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        {submitting ? "Creating account" : "Create account"}
      </button>
    </form>
  );
}