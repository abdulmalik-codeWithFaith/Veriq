"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";
import { generateCodes } from "./actions";

type Format = "text" | "qr";
type Errors = { product?: string; quantity?: string };

const MAX_BATCH = 1000;
const QR_PREVIEW = 24;
function verifyUrl(code: string) {
  return `${window.location.origin}/verify?code=${code}`;
}

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function GenerateForm() {
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [format, setFormat] = useState<Format>("text");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<{ codes: string[]; product: string; format: Format } | null>(null);
  const [qrImages, setQrImages] = useState<{ code: string; src: string }[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  // Draw QR previews for the first few codes of a QR batch.
  useEffect(() => {
    if (!result || result.format !== "qr") return setQrImages([]);
    let cancelled = false;
    Promise.all(
      result.codes.slice(0, QR_PREVIEW).map(async (code) => ({
        code,
        src: await QRCode.toDataURL(verifyUrl(code), { margin: 1, width: 320 }),
      })),
    ).then((imgs) => !cancelled && setQrImages(imgs));
    return () => {
      cancelled = true;
    };
  }, [result]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const qty = Number(quantity);
    const found: Errors = {};
    if (!product.trim()) found.product = "Enter the product name.";
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_BATCH)
      found.quantity = `Enter a whole number from 1 to ${MAX_BATCH}.`;
    setErrors(found);
    if (found.product) return document.getElementById("product")?.focus();
    if (found.quantity) return document.getElementById("quantity")?.focus();

    setBusy(true);
    setResult(null);
    try {
      const { codes } = await generateCodes({ product: product.trim(), details: details.trim(), quantity: qty });
      setResult({ codes, product: product.trim(), format });
    } catch {
      setFormError("We couldn’t generate the codes. Try again.");
    }
    setBusy(false);
  }

  async function copyAll() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.codes.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      setFormError("Couldn’t copy automatically. Download the CSV instead.");
    }
  }

  function downloadCsv() {
    if (!result) return;
    const rows = result.codes.map((c) => `${c},"${result.product.replace(/"/g, '""')}",${verifyUrl(c)}`);
    downloadFile(`veriq-codes-${Date.now()}.csv`, ["code,product,verification_link", ...rows].join("\n"), "text/csv");
  }

  const field = (err?: string) =>
    `w-full rounded-md border bg-white px-4 text-base ${err ? "border-danger" : "border-line"}`;

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        <div>
          <label htmlFor="product" className="text-sm font-semibold">Product name</label>
          <input id="product" value={product} onChange={(e) => setProduct(e.target.value)}
            aria-invalid={!!errors.product} aria-describedby={errors.product ? "product-error" : undefined}
            className={`mt-2 h-12 ${field(errors.product)}`} />
          {errors.product && <p id="product-error" role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors.product}</p>}
        </div>

        <div>
          <label htmlFor="details" className="text-sm font-semibold">
            Product information <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea id="details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
            aria-describedby="details-hint" className={`mt-2 py-3 ${field()}`} />
          <p id="details-hint" className="mt-1.5 text-sm text-muted">
            Shown to customers, for example size, batch number or expiry date.
          </p>
        </div>

        <div>
          <label htmlFor="quantity" className="text-sm font-semibold">How many codes?</label>
          <input id="quantity" type="number" inputMode="numeric" min={1} max={MAX_BATCH} value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "quantity-error" : "quantity-hint"}
            className={`mt-2 h-12 sm:w-48 ${field(errors.quantity)}`} />
          {errors.quantity ? (
            <p id="quantity-error" role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors.quantity}</p>
          ) : (
            <p id="quantity-hint" className="mt-1.5 text-sm text-muted">Up to {MAX_BATCH} in one batch.</p>
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Format</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {([
              { value: "text", title: "Text codes", body: "Short codes to print or stamp on the product." },
              { value: "qr", title: "QR codes", body: "Customers scan with their phone camera." },
            ] as const).map((o) => (
              <label key={o.value}
                className="cursor-pointer rounded-lg border border-line bg-white p-4 has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
                <input type="radio" name="format" value={o.value} checked={format === o.value}
                  onChange={() => setFormat(o.value)} className="sr-only" />
                <span className="block font-semibold">{o.title}</span>
                <span className="mt-1 block text-sm text-muted">{o.body}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {formError && (
          <p role="alert" className="rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger">{formError}</p>
        )}

        <button type="submit" disabled={busy}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70">
          {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          {busy ? "Generating" : "Generate codes"}
        </button>
      </form>

      {result && (
        <section aria-live="polite" className="mt-10 border-t-2 border-ink pt-6">
          <h3 className="font-serif text-xl font-semibold">
            {result.codes.length.toLocaleString("en-GB")} codes created for {result.product}
          </h3>
          <p className="mt-1 text-sm text-muted">They are saved to your account and customers can verify them now.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={downloadCsv}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              <Download className="size-4" aria-hidden="true" /> Download CSV
            </button>
            {result.format === "text" && (
              <button type="button" onClick={copyAll}
                className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:border-brand">
                {copiedAll ? "Copied" : "Copy all codes"}
              </button>
            )}
          </div>

          {result.format === "text" ? (
            <ul className="mt-5 grid max-h-72 gap-2 overflow-y-auto rounded-lg border border-line bg-white p-3 sm:grid-cols-2">
              {result.codes.slice(0, 200).map((c) => (
                <li key={c} className="font-mono text-sm font-semibold tracking-wider">{c}</li>
              ))}
              {result.codes.length > 200 && (
                <li className="text-sm text-muted sm:col-span-2">
                  Showing the first 200. Download the CSV for all {result.codes.length.toLocaleString("en-GB")}.
                </li>
              )}
            </ul>
          ) : (
            <>
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {qrImages.map(({ code, src }) => (
                  <li key={code} className="rounded-lg border border-line bg-white p-3 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`QR code for ${code}`} className="mx-auto size-28" />
                    <p className="mt-2 font-mono text-xs font-semibold tracking-wider">{code}</p>
                    <a href={src} download={`${code}.png`} className="mt-1 inline-block text-xs font-semibold text-brand underline underline-offset-4">
                      Download PNG
                    </a>
                  </li>
                ))}
              </ul>
              {result.codes.length > QR_PREVIEW && (
                <p className="mt-3 text-sm text-muted">
                  Showing {QR_PREVIEW} previews. The CSV has every code and its verification link,
                  which a printer can turn into QR codes.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
}