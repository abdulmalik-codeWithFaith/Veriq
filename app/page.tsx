"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Globe,
  Loader2,
  QrCode,
  ScanSearch,
  ShieldAlert,
  Smartphone,
  TriangleAlert,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { languages, translations, type Lang } from "./verify/translations";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* =========================================================
   Small building blocks
   ========================================================= */

/** Fades and lifts its content into view the first time it scrolls on screen. */
function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A thin bar at the top of the screen that fills as you scroll down the page. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-brand"
    />
  );
}

/** Counts up to a number the first time it is seen. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(reduce ? to : 0);
  const text = useTransform(value, (v) => Math.round(v).toLocaleString("en-GB"));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reduce, to, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-wider text-brand">{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
      {children}
    </h2>
  );
}

/* =========================================================
   1. Hero, with a phone that shows the three results on a loop
   ========================================================= */

type Phase = "scan" | "checking" | "genuine" | "repeat" | "invalid";

const script: { phase: Phase; ms: number }[] = [
  { phase: "scan", ms: 2200 },
  { phase: "checking", ms: 900 },
  { phase: "genuine", ms: 3300 },
  { phase: "scan", ms: 1700 },
  { phase: "checking", ms: 900 },
  { phase: "repeat", ms: 3300 },
  { phase: "scan", ms: 1700 },
  { phase: "checking", ms: 900 },
  { phase: "invalid", ms: 2800 },
];

const QR_SIZE = 11;
function qrOn(r: number, c: number) {
  const inFinder = (r0: number, c0: number) => r >= r0 && r < r0 + 3 && c >= c0 && c < c0 + 3;
  if (inFinder(0, 0) || inFinder(0, QR_SIZE - 3) || inFinder(QR_SIZE - 3, 0)) return true;
  return (r * 5 + c * 3 + ((r * c) % 4)) % 3 !== 0;
}

function PhoneScreen({ phase }: { phase: Phase }) {
  if (phase === "scan") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center bg-gradient-to-b from-ink to-[#143d70] px-6">
        <p className="mb-5 text-xs font-medium text-white/80">Point your camera at the code</p>
        <div className="relative w-44 rounded-xl bg-white p-3">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)` }}>
            {Array.from({ length: QR_SIZE * QR_SIZE }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-[1px] ${qrOn(Math.floor(i / QR_SIZE), i % QR_SIZE) ? "bg-ink" : "bg-transparent"}`}
              />
            ))}
          </div>
          <motion.div
            className="absolute inset-x-1 h-[3px] rounded-full bg-seal shadow-[0_0_14px_3px_rgba(14,143,99,0.7)]"
            initial={{ top: "6%" }}
            animate={{ top: "92%" }}
            transition={{ duration: 1.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  if (phase === "checking") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="size-9 animate-spin text-brand" aria-hidden="true" />
        <p className="text-sm font-semibold text-muted">Checking</p>
      </div>
    );
  }

  const styles = {
    genuine: { Icon: BadgeCheck, title: "Genuine product", note: "Registered by the manufacturer", box: "bg-seal-soft", accent: "text-seal" },
    repeat: { Icon: TriangleAlert, title: "Checked before. Be careful.", note: "This code was checked 3 times", box: "bg-amber-soft", accent: "text-amber" },
    invalid: { Icon: XCircle, title: "Code not recognised", note: "Don’t trust this product", box: "bg-danger-soft", accent: "text-danger" },
  }[phase];

  return (
    <div className="flex h-full flex-col bg-white p-5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`rounded-2xl p-5 text-center ${styles.box}`}
      >
        <styles.Icon className={`mx-auto size-12 ${styles.accent}`} aria-hidden="true" />
        <p className={`mt-3 font-semibold ${styles.accent}`}>{styles.title}</p>
        <p className="mt-1 text-xs text-ink/80">{styles.note}</p>
      </motion.div>

      {phase !== "invalid" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
          className="mt-4 rounded-xl border border-line p-4"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-ink font-serif text-lg font-semibold text-white">S</span>
            <div>
              <p className="text-[11px] text-muted">Manufacturer</p>
              <p className="text-sm font-semibold">Sample Foods Ltd</p>
            </div>
          </div>
          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[11px] text-muted">Product</p>
            <p className="text-sm font-semibold">Pure Spring Water 75cl</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FloatingChip({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold shadow-lg sm:flex ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function PhoneDemo() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) setI(2); // show one still result for people who prefer less motion
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => setI((n) => (n + 1) % script.length), script[i].ms);
    return () => clearTimeout(timer);
  }, [i, reduce]);

  const phase = script[i].phase;

  return (
    <div className="relative mx-auto w-full max-w-[19rem]">
      <p className="sr-only">
        An animated example of a phone scanning a product code and showing a genuine, checked-before or
        not-recognised result.
      </p>
      <div aria-hidden="true">
        <FloatingChip className="-right-6 top-16" delay={0.2}>
          <Globe className="size-4 text-brand" /> 5 languages
        </FloatingChip>
        <FloatingChip className="-left-10 bottom-24" delay={1}>
          <Smartphone className="size-4 text-brand" /> No app needed
        </FloatingChip>

        <motion.div
          className="rounded-[2.6rem] border-[10px] border-ink bg-ink shadow-2xl shadow-ink/25"
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mx-auto h-5 w-24 rounded-b-2xl bg-ink" />
          <div className="h-[30rem] overflow-hidden rounded-[1.8rem] bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${i}-${phase}`}
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <PhoneScreen phase={phase} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        <p className="mt-5 text-center text-xs text-muted">Sample product shown</p>
      </div>
    </div>
  );
}

function Hero() {
  const words = ["Let", "your", "customers", "check", "that", "your", "product", "is", "real."];
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Soft dotted background and two slowly drifting glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(11,43,74,0.09) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)",
          maskImage: "radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 size-96 rounded-full bg-brand/15 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 size-96 rounded-full bg-seal/15 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -26, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-seal opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-seal" />
            </span>
            Product verification for manufacturers and their customers
          </motion.p>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]">
            {words.map((word, idx) => {
              const last = idx === words.length - 1;
              return (
                <span key={idx} className={last ? "relative inline-block" : undefined}>
                  <motion.span
                    className={`inline-block ${last ? "text-seal" : ""}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 + idx * 0.07, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                  {last && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 120 12"
                      preserveAspectRatio="none"
                      className="absolute -bottom-1 left-0 h-2.5 w-full text-seal"
                    >
                      <motion.path
                        d="M2 8 Q 30 2 60 7 T 118 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: reduce ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1, duration: 0.7, ease: "easeOut" }}
                      />
                    </svg>
                  )}
                  {idx < words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            Veriq gives every product its own code. Customers enter or scan it and see in seconds
            whether it came from you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.95, ease: EASE }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/signup"
              className="rounded-md bg-brand px-6 py-3 text-center text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0"
            >
              Register your company
            </Link>
            <Link
              href="/verify"
              className="rounded-md border border-line bg-white px-6 py-3 text-center text-base font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-brand active:translate-y-0"
            >
              Verify a product
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
          >
            {["No account needed to check a product", "Scan a QR code or type a code", "Results in your language"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-seal" aria-hidden="true" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        >
          <PhoneDemo />
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   2. Facts strip (real facts about the product, counted up)
   ========================================================= */

function Facts() {
  const facts = [
    { to: 5, label: "languages for results" },
    { to: 1000, label: "codes in one batch" },
    { to: 3, label: "clear results" },
    { to: 0, label: "accounts customers need" },
  ];
  return (
    <section className="bg-ink text-white">
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 sm:px-8 lg:grid-cols-4">
        {facts.map((f, idx) => (
          <Reveal key={f.label} delay={idx * 0.08} y={16}>
            <div className="lg:border-l lg:border-white/15 lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <dd className="font-serif text-4xl font-semibold tabular-nums sm:text-5xl">
                <CountUp to={f.to} />
              </dd>
              <dt className="mt-1 text-sm text-white/75">{f.label}</dt>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

/* =========================================================
   3. The problem
   ========================================================= */

function Problem() {
  const items = [
    {
      Icon: Users,
      title: "Customers can’t tell",
      body: "A fake can look exactly like the real thing, and there is no easy way to check before you buy or use it.",
    },
    {
      Icon: ShieldAlert,
      title: "Honest makers lose out",
      body: "Copies take sales and harm a name that took years to build.",
    },
    {
      Icon: Wrench,
      title: "Few tools fit",
      body: "Existing options are often big, costly and complicated, and rarely speak the languages people use every day.",
    },
  ];
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <Reveal>
        <Eyebrow>The problem</Eyebrow>
        <SectionTitle>Fake products cost people their trust, and sometimes their health.</SectionTitle>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Veriq is built to give both sides a simple way to know what is real.
        </p>
      </Reveal>
      <ul className="space-y-4">
        {items.map(({ Icon, title, body }, idx) => (
          <Reveal key={title} delay={idx * 0.12}>
            <li className="group flex gap-5 rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg hover:shadow-ink/5">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-paper text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   4. How it works (a line fills in as you scroll)
   ========================================================= */

const steps = [
  { Icon: Building2, title: "Register your company", body: "Send your business details, logo and documents. It takes a few minutes." },
  { Icon: BadgeCheck, title: "Get approved", body: "We review every company before it can create codes. This keeps Veriq trusted by customers." },
  { Icon: QrCode, title: "Create codes for your products", body: "Make up to 1,000 codes at a time, as text or QR codes, and put one on every product." },
  { Icon: ScanSearch, title: "Customers check", body: "They enter or scan the code and see at once whether the product is genuine." },
];

function Step({ Icon, title, body, index }: (typeof steps)[number] & { index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const active = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <li ref={ref} className="relative pb-14 pl-16 last:pb-0">
      <span
        className={`absolute left-0 top-0 grid size-10 place-items-center rounded-full border-2 transition-colors duration-500 ${
          active || seen ? "border-brand bg-brand text-white" : "border-line bg-white text-muted"
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={seen ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="text-sm font-semibold text-muted">Step {index + 1}</p>
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-lg leading-relaxed text-muted">{body}</p>
      </motion.div>
    </li>
  );
}

function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });

  return (
    <section id="how-it-works" className="border-y border-line bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>From sign-up to a verified product in four steps.</SectionTitle>
        </Reveal>

        <ol ref={ref} className="relative">
          <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 w-0.5 -translate-x-1/2 bg-line" />
          <motion.div
            aria-hidden="true"
            style={{ scaleY }}
            className="absolute bottom-0 left-5 top-0 w-0.5 origin-top -translate-x-1/2 bg-brand"
          />
          {steps.map((s, idx) => (
            <Step key={s.title} {...s} index={idx} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/* =========================================================
   5. Try it (the interactive demo, with sample codes)
   ========================================================= */

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
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [empty, setEmpty] = useState(false);
  const [busy, setBusy] = useState(false);

  function check(value: string) {
    const clean = value.replace(/\s+/g, "").toUpperCase();
    if (!clean) {
      setEmpty(true);
      setStatus(null);
      return;
    }
    setEmpty(false);
    setStatus(null);
    setBusy(true);
    setTimeout(() => {
      setStatus(sampleCodes[clean] ?? "invalid");
      setBusy(false);
    }, 600);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    check(code);
  }

  const result = status ? resultContent[status] : null;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-xl shadow-ink/5 sm:p-7">
      <h3 className="font-serif text-2xl font-semibold">Try a verification</h3>
      <p className="mt-1 text-sm text-muted">This demo uses sample codes only.</p>

      <form onSubmit={onSubmit} className="mt-5">
        <label htmlFor="demo-code" className="text-sm font-semibold">Product code</label>
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
            disabled={busy}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
          >
            {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
            {busy ? "Checking" : "Verify"}
          </button>
        </div>
        {empty && <p className="mt-2 text-sm font-medium text-danger">Enter the code printed on your product.</p>}
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
            className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-xs font-medium text-ink transition-colors hover:border-brand"
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
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={`flex gap-3 rounded-lg border-l-4 p-4 ${result.box}`}
            >
              <result.Icon className={`mt-0.5 size-6 shrink-0 ${result.accent}`} aria-hidden="true" />
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

function TryIt() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <Reveal>
        <Eyebrow>See it work</Eyebrow>
        <SectionTitle>Check a product the way your customers will.</SectionTitle>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Type one of the sample codes. The first check says genuine. Later checks say the code was
          checked before, which is how a copied code gets caught.
        </p>
        <Link href="/verify" className="mt-6 inline-block font-semibold text-brand underline underline-offset-4">
          Have a real product? Verify it here
        </Link>
      </Reveal>
      <Reveal delay={0.15}>
        <VerifyDemo />
      </Reveal>
    </section>
  );
}

/* =========================================================
   6. Benefits, with switchable tabs
   ========================================================= */

const photos = {
  makers: {
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

const audiences = {
  makers: {
    label: "For manufacturers",
    heading: "Protect your products and your name",
    items: [
      "Show customers which products really come from you",
      "Create codes in batches and see which ones are used",
      "Add a checker to your website, or share a link if you don’t have one",
      "See when a code is checked again and again",
    ],
  },
  customers: {
    label: "For customers",
    heading: "Know what you are buying",
    items: [
      "Check a product in seconds, with no account and no app",
      "See the manufacturer’s name, logo and product details",
      "Get a clear warning when a code looks suspicious",
      "Read the result in your own language",
    ],
  },
} as const;

type Tab = keyof typeof audiences;

function Photo({ photo }: { photo: (typeof photos)[Tab] }) {
  return (
    <figure>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={1200}
        height={800}
        sizes="(min-width: 1152px) 540px, (min-width: 768px) 45vw, 100vw"
        className="aspect-[3/2] w-full rounded-xl object-cover"
      />
    </figure>
  );
}

function Audience() {
  const [tab, setTab] = useState<Tab>("makers");
  const current = audiences[tab];

  return (
    <section id="benefits" className="border-y border-line bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <Eyebrow>Benefits</Eyebrow>
          <SectionTitle>Made for manufacturers and the people who buy from them.</SectionTitle>
        </Reveal>

        <div role="tablist" aria-label="Who is it for" className="mt-8 inline-flex rounded-full border border-line bg-paper p-1">
          {(Object.keys(audiences) as Tab[]).map((key) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setTab(key)}
              className="relative rounded-full px-5 py-2 text-sm font-semibold"
            >
              {tab === key && (
                <motion.span
                  layoutId="audience-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${tab === key ? "text-white" : "text-ink"}`}>{audiences[key].label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-10 grid items-center gap-10 md:grid-cols-2 md:gap-14"
          >
            <Photo photo={photos[tab]} />
            <div>
              <h3 className="font-serif text-2xl font-semibold">{current.heading}</h3>
              <ul className="mt-6 space-y-4">
                {current.items.map((item, idx) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + idx * 0.08, duration: 0.4, ease: EASE }}
                    className="flex gap-3"
                  >
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-seal-soft">
                      <Check className="size-4 text-seal" aria-hidden="true" />
                    </span>
                    <span className="text-base leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* =========================================================
   7. Languages (uses the real translations from the verify page)
   ========================================================= */

function Languages() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [lang, setLang] = useState<Lang>("en");
  const [touched, setTouched] = useState(false);
  const t = translations[lang];

  // Rotates through the languages while the section is on screen, until someone picks one.
  useEffect(() => {
    if (!inView || touched || reduce) return;
    const timer = setInterval(() => {
      setLang((current) => {
        const idx = languages.findIndex((l) => l.code === current);
        return languages[(idx + 1) % languages.length].code;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [inView, touched, reduce]);

  return (
    <section ref={ref} id="languages" className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <Reveal>
        <Eyebrow>Languages</Eyebrow>
        <SectionTitle>Results in the language your customers speak.</SectionTitle>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          A result you can’t read is no use. Customers can switch the whole page to the language they are
          most comfortable in.
        </p>
        <div role="group" aria-label="Choose a language" className="mt-8 flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              aria-pressed={lang === l.code}
              onClick={() => {
                setTouched(true);
                setLang(l.code);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                lang === l.code
                  ? "bg-ink text-white shadow-md"
                  : "border border-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xl shadow-ink/5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              lang={lang}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="text-sm font-semibold">{t.codeLabel}</p>
              <div className="mt-2 flex gap-3">
                <div className="flex h-12 flex-1 items-center rounded-md border border-line bg-paper px-4 font-mono tracking-wider">
                  VR8K29PX
                </div>
                <div className="flex h-12 items-center rounded-md bg-brand px-5 font-semibold text-white">{t.verify}</div>
              </div>

              <div className="mt-5 flex gap-3 rounded-lg border-l-4 border-seal bg-seal-soft p-4">
                <BadgeCheck className="mt-0.5 size-6 shrink-0 text-seal" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-seal">{t.genuineTitle}</p>
                  <p className="mt-1 text-sm text-ink">{t.genuineBody}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-3 rounded-lg border border-line p-4 text-sm">
                <div>
                  <dt className="text-muted">{t.manufacturer}</dt>
                  <dd className="font-semibold">Sample Foods Ltd</dd>
                </div>
                <div>
                  <dt className="text-muted">{t.product}</dt>
                  <dd className="font-semibold">Pure Spring Water 75cl</dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

/* =========================================================
   8. On your website, or without one
   ========================================================= */

function Website() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <Eyebrow>Share it your way</Eyebrow>
          <SectionTitle>On your website, or without one.</SectionTitle>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl bg-ink p-6 text-white sm:p-8">
              <h3 className="text-lg font-semibold">Paste it into your site</h3>
              <p className="mt-1 text-sm text-white/75">
                Copy one small piece of code from your dashboard and paste it where you want the checker.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-lg bg-black/30 p-4 text-[13px] leading-relaxed text-white/90">
                <code>{`<iframe
  src="https://your-site.com/embed/verify
       ?company=your-company"
  title="Verify your product"
  width="100%"
  height="560"
  style="border:0;max-width:480px"
></iframe>`}</code>
              </pre>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="h-full rounded-2xl border border-line bg-paper p-6 sm:p-8">
              <h3 className="text-lg font-semibold">Or just share a link</h3>
              <p className="mt-1 text-sm text-muted">
                No website? Every company gets its own verification link to send to customers or print on packaging.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-line bg-white p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-seal-soft text-seal">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-sm">your-site.com/verify?company=your-company</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   9. Questions
   ========================================================= */

const faqs = [
  {
    q: "Do customers need an account or an app?",
    a: "No. They open a link or scan a QR code with their phone camera, and the check runs in their browser.",
  },
  {
    q: "What if someone copies a code onto a fake product?",
    a: "A printed code can always be copied, and Veriq can’t stop that. But the first check says genuine, and every later check says the code was checked before, with a count. A copied code gets flagged as soon as it is checked more than once.",
  },
  {
    q: "Do I need a website?",
    a: "No. Share your verification link with customers, or paste the checker into your site if you have one.",
  },
  {
    q: "How do I get approved?",
    a: "Register with your business details, logo and documents. We review each application, and either approve it or tell you what to fix so you can apply again.",
  },
  {
    q: "Does Veriq keep a record of who checked a code?",
    a: "No. It only updates the code’s check count and the time of the check. Customers are never asked for their name, email or phone number.",
  },
  {
    q: "How many codes can I create?",
    a: "Up to 1,000 in one batch, as text codes or QR codes. You can create more batches whenever you need them.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <Reveal>
        <Eyebrow>Questions</Eyebrow>
        <SectionTitle>Things people ask us.</SectionTitle>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {faqs.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <li key={item.q}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${idx}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold sm:px-6"
                  >
                    {item.q}
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-muted">
                      <ChevronDown className="size-5" aria-hidden="true" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

/* =========================================================
   10. Final call to action
   ========================================================= */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-brand/40 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 size-96 rounded-full bg-seal/30 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <h2 className="max-w-xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Ready to protect your products?
          </h2>
          <p className="mt-3 max-w-lg text-white/80">
            Register your company and tell us about your business. We review every application, and your
            dashboard opens as soon as you are approved.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-md bg-white px-7 py-3.5 text-center text-base font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-paper"
            >
              Register your company
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/40 px-7 py-3.5 text-center text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   The page
   ========================================================= */

export default function Home() {
  return (
    // Respects people who have turned off animations in their device settings.
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Hero />
      <Facts />
      <Problem />
      <HowItWorks />
      <TryIt />
      <Audience />
      <Languages />
      <Website />
      <Faq />
      <FinalCta />
    </MotionConfig>
  );
}