"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, X } from "lucide-react";

const categories = [
  "Food and beverages",
  "Pharmaceuticals and health",
  "Cosmetics and personal care",
  "Electronics and appliances",
  "Agrochemicals and fertilizers",
  "Auto parts",
  "Building materials",
  "Household goods",
  "Other",
];

const MAX_LOGO = 2 * 1024 * 1024; // 2 MB
const MAX_DOC = 5 * 1024 * 1024; // 5 MB
const MAX_DOCS = 5;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const DOC_TYPES = ["application/pdf", "image/png", "image/jpeg"];

type Fields = {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  category: string;
};
type Errors = Partial<Record<keyof Fields | "logo" | "documents", string>>;

/* TODO: replace with your real API call. Send `data` as multipart/form-data. */
async function submitApplication(data: FormData) {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="ml-2 font-normal text-muted">(optional)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t-2 border-ink pt-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-serif text-xl font-semibold" aria-hidden="true">
        {title}
      </h2>
      {children}
    </fieldset>
  );
}

const fileClass =
  "block w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark";

export function OnboardingForm() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    category: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [docs, setDocs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Logo preview
  useEffect(() => {
    if (!logo) {
      setLogoUrl("");
      return;
    }
    const url = URL.createObjectURL(logo);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  function setField(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, logo: "Use a PNG, JPG or WebP image." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO) {
      setErrors((p) => ({ ...p, logo: "The logo must be smaller than 2 MB." }));
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, logo: undefined }));
    setLogo(file);
  }

  function onDocsChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const bad = picked.find((f) => !DOC_TYPES.includes(f.type));
    if (bad) {
      setErrors((p) => ({ ...p, documents: `“${bad.name}” isn’t allowed. Use PDF, PNG or JPG files.` }));
      return;
    }
    const big = picked.find((f) => f.size > MAX_DOC);
    if (big) {
      setErrors((p) => ({ ...p, documents: `“${big.name}” is larger than 5 MB.` }));
      return;
    }
    if (docs.length + picked.length > MAX_DOCS) {
      setErrors((p) => ({ ...p, documents: `You can upload up to ${MAX_DOCS} documents.` }));
      return;
    }
    setErrors((p) => ({ ...p, documents: undefined }));
    setDocs((prev) => [...prev, ...picked]);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "Enter your business name.";
    if (!fields.address.trim()) e.address = "Enter your business address.";
    if (!fields.email.trim()) e.email = "Enter your business email.";
    else if (!/^\S+@\S+\.\S+$/.test(fields.email.trim()))
      e.email = "Enter a valid email, like info@company.com.";
    if (!fields.phone.trim()) e.phone = "Enter a phone number.";
    else if (fields.phone.replace(/\D/g, "").length < 7)
      e.phone = "Enter a valid phone number.";
    if (fields.website.trim() && !/^(https?:\/\/)?[^\s.]+\.\S{2,}$/.test(fields.website.trim()))
      e.website = "Enter a valid website, like www.company.com.";
    if (!fields.category) e.category = "Choose a product category.";
    if (!logo) e.logo = "Upload your business logo.";
    if (docs.length === 0) e.documents = "Upload at least one verification document.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);

    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      document.getElementById(firstKey)?.focus();
      return;
    }

    const data = new FormData();
    Object.entries(fields).forEach(([k, v]) => data.append(k, v.trim()));
    if (logo) data.append("logo", logo);
    docs.forEach((d) => data.append("documents", d));

    setSubmitting(true);
    try {
      await submitApplication(data);
      router.push("/pending");
    } catch {
      setFormError("We couldn’t send your application. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const input = (key: keyof Errors) =>
    `h-12 w-full rounded-md border bg-white px-4 text-base ${
      errors[key] ? "border-danger" : "border-line"
    }`;
  const aria = (key: keyof Errors) => ({
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 space-y-10">
      <Section title="Business details">
        <Field id="name" label="Business name" error={errors.name}>
          <input id="name" autoComplete="organization" value={fields.name}
            onChange={(e) => setField("name", e.target.value)} className={input("name")} {...aria("name")} />
        </Field>
        <Field id="address" label="Business address" error={errors.address}>
          <input id="address" autoComplete="street-address" value={fields.address}
            onChange={(e) => setField("address", e.target.value)} className={input("address")} {...aria("address")} />
        </Field>
        <Field id="category" label="Product category" error={errors.category}
          hint="Choose the main type of product you make.">
          <select id="category" value={fields.category}
            onChange={(e) => setField("category", e.target.value)} className={input("category")} {...aria("category")}>
            <option value="">Select a category</option>
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </Field>
      </Section>

      <Section title="Contact">
        <Field id="email" label="Business email" error={errors.email}>
          <input id="email" type="email" inputMode="email" autoComplete="email" value={fields.email}
            onChange={(e) => setField("email", e.target.value)} className={input("email")} {...aria("email")} />
        </Field>
        <Field id="phone" label="Phone number" error={errors.phone} hint="Include the country code, like +234.">
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone}
            onChange={(e) => setField("phone", e.target.value)} className={input("phone")} {...aria("phone")} />
        </Field>
        <Field id="website" label="Business website" optional error={errors.website}>
          <input id="website" type="url" inputMode="url" autoComplete="url" value={fields.website}
            onChange={(e) => setField("website", e.target.value)} className={input("website")} {...aria("website")} />
        </Field>
      </Section>

      <Section title="Logo">
        <Field id="logo" label="Business logo" error={errors.logo} hint="PNG, JPG or WebP, up to 2 MB.">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-white">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo preview" className="size-full object-contain" />
              ) : (
                <span className="px-2 text-center text-xs text-muted">No logo yet</span>
              )}
            </div>
            <input id="logo" type="file" accept={LOGO_TYPES.join(",")} onChange={onLogoChange}
              className={fileClass} {...aria("logo")} />
          </div>
        </Field>
      </Section>

      <Section title="Verification documents">
        <Field id="documents" label="Documents that prove your business is real" error={errors.documents}
          hint={`For example, your business registration certificate and any product registration that applies to you. PDF, PNG or JPG, up to 5 MB each, ${MAX_DOCS} files at most.`}>
          <input id="documents" type="file" multiple accept={DOC_TYPES.join(",")}
            onChange={onDocsChange} disabled={docs.length >= MAX_DOCS} className={fileClass} {...aria("documents")} />
        </Field>

        {docs.length > 0 && (
          <ul className="space-y-2">
            {docs.map((doc, i) => (
              <li key={`${doc.name}-${i}`}
                className="flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5">
                <FileText className="size-5 shrink-0 text-brand" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{doc.name}</span>
                <span className="shrink-0 text-sm text-muted">{formatSize(doc.size)}</span>
                <button type="button" onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={`Remove ${doc.name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-paper hover:text-danger">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {formError && (
        <p role="alert" className="rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger">
          {formError}
        </p>
      )}

      <div>
        <button type="submit" disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-8">
          {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          {submitting ? "Submitting" : "Submit application"}
        </button>
        <p className="mt-3 text-sm text-muted">
          You won’t be able to open your dashboard until we approve your application.
        </p>
      </div>
    </form>
  );
}