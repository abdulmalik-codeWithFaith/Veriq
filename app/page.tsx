"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Check,
  QrCode,
  ScanSearch,
  TriangleAlert,
  XCircle,
} from "lucide-react";

/* ---------- Demo verification (sample data only) ---------- */

type Status = "genuine" | "repeat" | "invalid";

const sampleCodes: Record<string, Status> = {
  VR8K29PX: "genuine",
  AB7M42QX: "repeat",
};

const resultContent = {
  genuine: {
    Icon: BadgeCheck,
    title: "Genuine product",
    body: "This code is registered to Sample Manufacturer Ltd. Product: Pure Spring Water, 75cl.",
    box: "border-seal bg-seal-soft",
    accent: "text-seal",
  },
  repeat: {
    Icon: TriangleAlert,
    title: "Checked before. Be careful.",
    body: "This code has already been verified several times. If it wasn’t you, the product may be a copy.",
    box: "border-amber bg-amber-soft",
    accent: "text-amber",
  },
  invalid: {
    Icon: XCircle,
    title: "Code not recognised",
    body: "Check the characters and try again. If the code is correct, don’t trust this product.",
    box: "border-danger bg-danger-soft",
    accent: "text-danger",
  },
} as const;

function VerifyDemo() {
  const reduce = useReducedMotion();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [empty, setEmpty] = useState(false);

  function check(value: string) {
    const clean = value.replace(/\s+/g, "").toUpperCase();
    if (!clean) {
      setEmpty(true);
      setStatus(null);
      return;
    }
    setEmpty(false);
    setStatus(sampleCodes[clean] ?? "invalid");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    check(code);
  }

  const result = status ? resultContent[status] : null;

  return (
    <div className="rounded-xl border border-line bg-paper p-5 sm:p-7">
      <h2 className="font-serif text-2xl font-semibold">Try a verification</h2>
      <p className="mt-1 text-sm text-muted">
        This is a demo. Real codes come from the manufacturer on the product.
      </p>

      <form onSubmit={onSubmit} className="mt-5">
        <label htmlFor="demo-code" className="text-sm font-semibold">
          Product code
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="demo-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="For example, VR8K29PX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-12 w-full rounded-md border border-line bg-white px-4 font-mono text-base uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-md bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Verify
          </button>
        </div>
        {empty && (
          <p className="mt-2 text-sm font-medium text-danger">
            Enter the code printed on your product.
          </p>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>Try:</span>
        {["VR8K29PX", "AB7M42QX", "ZZ000000"].map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              setCode(sample);
              check(sample);
            }}
            className="rounded-md border border-line bg-white px-2.5 py-1 font-mono text-xs font-medium text-ink hover:border-brand"
          >
            {sample}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-5 min-h-[7.5rem]">
        <AnimatePresence mode="wait">
          {result && status && (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
              className={`flex gap-3 rounded-lg border-l-4 p-4 ${result.box}`}
            >
              <result.Icon
                className={`mt-0.5 size-6 shrink-0 ${result.accent}`}
                aria-hidden="true"
              />
              <div>
                <p className={`font-semibold ${result.accent}`}>{result.title}</p>
                <p className="mt-1 text-sm text-ink">{result.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Page content ---------- */

const steps = [
  {
    Icon: Building2,
    title: "Register your company",
    body: "Send your business details and documents. We review them and email you when you’re approved.",
  },
  {
    Icon: QrCode,
    title: "Create codes for your products",
    body: "Generate codes in batches, as text or QR codes, and put one on every product.",
  },
  {
    Icon: ScanSearch,
    title: "Customers verify",
    body: "A customer enters or scans the code and sees at once whether it is genuine.",
  },
];

const manufacturerBenefits = [
  "Show customers which products really come from you",
  "Make codes in batches and track which are used",
  "Add a checker to your website, or share a link if you don’t have one",
  "See when a code is checked again and again",
];

const customerBenefits = [
  "Know a product is genuine before you use it",
  "See the manufacturer’s name, logo and product details",
  "Get a clear warning when a code looks suspicious",
  "Read the result in your own language",
];

const languages = ["English", "Français", "Yorùbá", "Hausa", "Igbo"];

const photos = {
  manufacturers: {
    src: "https://images.unsplash.com/photo-1742485243447-fdf53d46bc30?auto=format&fit=crop&w=1200&q=75",
    alt: "A factory worker sorting and folding finished goods",
    credit: "EqualStock",
    href: "https://unsplash.com/photos/a-worker-is-sorting-and-folding-finished-items-8jaXxFltPcc",
  },
  customers: {
    src: "https://images.unsplash.com/photo-1706759755832-47e53579cc0d?auto=format&fit=crop&w=1200&q=75",
    alt: "A person scanning a QR code with a phone",
    credit: "Marielle Ursua",
    href: "https://unsplash.com/photos/a-person-using-a-laptop-computer-with-a-qr-code-on-the-screen-v9bLIYP20xw",
  },
};

function Photo({ photo }: { photo: (typeof photos)[keyof typeof photos] }) {
  return (
    <figure>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={1200}
        height={800}
        sizes="(min-width: 1152px) 540px, (min-width: 768px) 45vw, 100vw"
        className="aspect-[3/2] w-full rounded-lg object-cover"
      />
      <figcaption className="mt-2 text-xs text-muted">
        Photo by{" "}
        <a href={photo.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {photo.credit}
        </a>{" "}
        on{" "}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Unsplash
        </a>
      </figcaption>
    </figure>
  );
}

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-1 size-5 shrink-0 text-seal" aria-hidden="true" />
          <span className="text-base leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Let your customers check that your product is real.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Veriq gives every product its own code. Customers enter or scan
              it and see in seconds whether it came from you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-md bg-brand px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Register your company
              </Link>
              <Link
                href="/verify"
                className="rounded-md border border-line bg-white px-6 py-3 text-center text-base font-semibold text-ink transition-colors hover:border-brand"
              >
                Verify a product
              </Link>
            </div>
          </div>
          <VerifyDemo />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          How product verification works
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ Icon, title, body }, i) => (
            <li key={title} className="border-t-2 border-ink pt-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-ink text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-muted">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-y border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Made for manufacturers and the people who buy from them
          </h2>
          <div className="mt-10 grid gap-14 md:grid-cols-2 md:gap-12">
            <div>
              <Photo photo={photos.manufacturers} />
              <h3 className="mt-6 text-xl font-semibold">For manufacturers</h3>
              <BenefitList items={manufacturerBenefits} />
            </div>
            <div>
              <Photo photo={photos.customers} />
              <h3 className="mt-6 text-xl font-semibold">For customers</h3>
              <BenefitList items={customerBenefits} />
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Results in the language your customers speak
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Customers can switch the verification page to any of these languages.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {languages.map((lang) => (
            <li
              key={lang}
              className="rounded-md border border-line bg-white px-5 py-2.5 text-base font-medium"
            >
              {lang}
            </li>
          ))}
        </ul>
      </section>

      {/* Final call to action */}
      <section className="bg-ink text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight">
              Ready to protect your products?
            </h2>
            <p className="mt-2 text-white/80">
              Register your company. We’ll email you once your application is approved.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 text-center text-base font-semibold text-ink transition-colors hover:bg-paper"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/40 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}