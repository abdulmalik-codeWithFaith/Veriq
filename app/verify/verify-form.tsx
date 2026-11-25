"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Loader2, TriangleAlert, XCircle } from "lucide-react";
import { languages, translations, type Lang } from "./translations";

type Manufacturer = { name: string; logoUrl?: string };
type Product = { name: string; details?: string };
type Result =
  | { status: "genuine"; manufacturer: Manufacturer; product: Product }
  | { status: "repeat"; count: number; manufacturer: Manufacturer; product: Product }
  | { status: "invalid" };

/*
  TODO: replace with a real server call.
  The server must look the code up, add this check to its verification count (atomically),
  and return the result. It should also limit how often one device or IP can try codes,
  so nobody can guess codes by trial and error. This demo uses sample data only.
*/
async function verifyCode(code: string): Promise<Result> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const sample = {
    manufacturer: { name: "Greenfield Beverages Ltd" },
    product: { name: "Pure Spring Water 75cl", details: "Batch Nov 2026. Best before Nov 2027." },
  };
  if (code === "VR8K29PX") return { status: "genuine", ...sample };
  if (code === "AB7M42QX") return { status: "repeat", count: 3, ...sample };
  return { status: "invalid" };
}

const looks = {
  genuine: { Icon: BadgeCheck, box: "border-seal bg-seal-soft", accent: "text-seal" },
  repeat: { Icon: TriangleAlert, box: "border-amber bg-amber-soft", accent: "text-amber" },
  invalid: { Icon: XCircle, box: "border-danger bg-danger-soft", accent: "text-danger" },
  error: { Icon: XCircle, box: "border-danger bg-danger-soft", accent: "text-danger" },
} as const;

export function VerifyForm() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const autoRan = useRef(false);

  const [lang, setLang] = useState<Lang>("en");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [result, setResult] = useState<Result | "error" | null>(null);

  const t = translations[lang];

  async function run(value: string) {
    const clean = value.replace(/\s+/g, "").toUpperCase();
    if (!clean) {
      setEmpty(true);
      setResult(null);
      inputRef.current?.focus();
      return;
    }
    setEmpty(false);
    setBusy(true);
    setResult(null);
    try {
      setResult(await verifyCode(clean));
    } catch {
      setResult("error");
    }
    setBusy(false);
  }

  // A scanned QR code opens /verify?code=XXXX, so check it straight away.
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    const fromLink = params.get("code");
    if (fromLink) void run(fromLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run(code);
  }

  function reset() {
    setResult(null);
    setCode("");
    inputRef.current?.focus();
  }

  const key = result === "error" ? "error" : result?.status;
  const look = key ? looks[key] : null;
  const title = key
    ? { genuine: t.genuineTitle, repeat: t.repeatTitle, invalid: t.invalidTitle, error: t.errorTitle }[key]
    : "";
  const body =
    result === "error"
      ? t.errorBody
      : result?.status === "genuine"
        ? t.genuineBody
        : result?.status === "repeat"
          ? t.repeatBody.replace("{count}", String(result.count))
          : result?.status === "invalid"
            ? t.invalidBody
            : "";
  const Icon = look?.Icon;

  return (
    <>
      <div role="group" aria-label="Language" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-muted">{t.language}</span>
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              lang === l.code ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-brand"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div lang={lang} className="mt-8">
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {t.pageTitle}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{t.intro}</p>

        <form onSubmit={onSubmit} noValidate className="mt-8">
          <label htmlFor="code" className="text-sm font-semibold">{t.codeLabel}</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              ref={inputRef}
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.placeholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={empty}
              aria-describedby={empty ? "code-error" : undefined}
              className={`h-14 w-full rounded-md border bg-white px-4 font-mono text-lg uppercase tracking-wider placeholder:font-sans placeholder:text-base placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70 ${
                empty ? "border-danger" : "border-line"
              }`}
            />
            <button
              type="submit"
              disabled={busy}
              className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
              {busy ? t.verifying : t.verify}
            </button>
          </div>
          {empty && (
            <p id="code-error" role="alert" className="mt-2 text-sm font-medium text-danger">{t.emptyError}</p>
          )}
        </form>

        <div aria-live="polite" className="mt-6">
          <AnimatePresence mode="wait">
            {result && look && Icon && (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
              >
                <div className={`flex gap-3 rounded-lg border-l-4 p-5 ${look.box}`}>
                  <Icon className={`mt-0.5 size-7 shrink-0 ${look.accent}`} aria-hidden="true" />
                  <div>
                    <p className={`text-lg font-semibold ${look.accent}`}>{title}</p>
                    <p className="mt-1 text-base leading-relaxed text-ink">{body}</p>
                  </div>
                </div>

                {result !== "error" && result.status !== "invalid" && (
                  <div className="mt-4 rounded-lg border border-line bg-white p-5">
                    <div className="flex items-center gap-4">
                      {result.manufacturer.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={result.manufacturer.logoUrl} alt="" className="size-14 rounded-md border border-line object-contain" />
                      ) : (
                        <span aria-hidden="true" className="grid size-14 place-items-center rounded-md bg-ink font-serif text-xl font-semibold text-white">
                          {result.manufacturer.name.charAt(0)}
                        </span>
                      )}
                      <div>
                        <p className="text-sm text-muted">{t.manufacturer}</p>
                        <p className="font-semibold">{result.manufacturer.name}</p>
                      </div>
                    </div>
                    <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                      <div>
                        <dt className="text-muted">{t.product}</dt>
                        <dd className="font-semibold">{result.product.name}</dd>
                      </div>
                      {result.product.details && (
                        <div>
                          <dt className="text-muted">{t.details}</dt>
                          <dd>{result.product.details}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 rounded-md border border-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-brand"
                >
                  {t.checkAnother}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}