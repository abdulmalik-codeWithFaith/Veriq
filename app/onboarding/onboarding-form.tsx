"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, X } from "lucide-react";
import { categories } from "@/lib/categories";

const MAX_LOGO = 1_000_000; // 1 MB
const MAX_DOC = 3_000_000; // 3 MB each
const MAX_TOTAL = 4_000_000; // 4 MB in total (the host rejects bigger requests)
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

async function submitApplication(data: FormData) {
  const res = await fetch("/api/onboarding", { method: "POST", body: data });
  if (!res.ok) {
    let message = "We couldn’t send your application. Try again.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
}

/** Phone photos are big. This makes JPG and PNG images smaller before they upload. */
async function shrink(file: File, maxSide: number, keepTransparency: boolean): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    const png = keepTransparency && file.type !== "image/jpeg";
    if (!png) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const type = png ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.8));
    if (!blob || blob.size >= file.size) return file; // keep the original if nothing was gained
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + (png ? ".png" : ".jpg"), { type });
  } catch {
    return file;
  }
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

  async function onLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!LOGO_TYPES.includes(picked.type)) {
      setErrors((p) => ({ ...p, logo: "Use a PNG, JPG or WebP image." }));
      return;
    }
    const file = await shrink(picked, 800, true);
    if (file.size > MAX_LOGO) {
      setErrors((p) => ({ ...p, logo: "The logo is too large. Use an image under 1 MB." }));
      return;
    }
    setErrors((p) => ({ ...p, logo: undefined }));
    setLogo(file);
  }

  async function onDocsChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (picked.length === 0) return;

    const bad = picked.find((f) => !DOC_TYPES.includes(f.type));
    if (bad) {
      setErrors((p) => ({ ...p, documents: `“${bad.name}” isn’t allowed. Use PDF, PNG or JPG files.` }));
      return;
    }
    if (docs.length + picked.length > MAX_DOCS) {
      setErrors((p) => ({ ...p, documents: `You can upload up to ${MAX_DOCS} documents.` }));
      return;
    }
    const ready = await Promise.all(picked.map((f) => shrink(f, 1600, false)));
    const big = ready.find((f) => f.size > MAX_DOC);
    if (big) {
      setErrors((p) => ({ ...p, documents: `“${big.name}” is larger than 3 MB. Use a smaller file.` }));
      return;
    }
    const total = [...docs, ...ready].reduce((n, f) => n + f.size, 0) + (logo?.size ?? 0);
    if (total > MAX_TOTAL) {
      setErrors((p) => ({ ...p, documents: "Your files add up to more than 4 MB. Remove one or use smaller files." }));
      return;
    }
    setErrors((p) => ({ ...p, documents: undefined }));
    setDocs((prev) => [...prev, ...ready]);
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
    else if (docs.reduce((n, f) => n + f.size, 0) + (logo?.size ?? 0) > MAX_TOTAL)
      e.documents = "Your files add up to more than 4 MB. Remove one or use smaller files.";
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
    } catch (err) {
      setFormError(
        err instanceof Error && !(err instanceof TypeError)
          ? err.message
          : "We couldn’t send your application. Check your connection and try again.",
      );
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
        <Field id="logo" label="Business logo" error={errors.logo} hint="PNG, JPG or WebP, up to 1 MB. Big photos are made smaller for you.">
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
          hint={`For example, your business registration certificate and any product registration that applies to you. PDF, PNG or JPG, up to 3 MB each and 4 MB in total, ${MAX_DOCS} files at most. Photos are made smaller for you.`}>
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