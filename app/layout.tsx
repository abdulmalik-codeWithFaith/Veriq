import type { Metadata, Viewport } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Menu, ShieldCheck, X } from "lucide-react";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Veriq: check that a product is genuine",
    template: "%s | Veriq",
  },
  description:
    "Veriq lets manufacturers give every product a unique code, so customers can confirm it is genuine in seconds.",
};

export const viewport: Viewport = {
  themeColor: "#0b2b4a",
};

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/#languages", label: "Languages" },
  { href: "/verify", label: "Verify a product" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-serif text-xl font-semibold text-ink"
      aria-label="Veriq home"
    >
      <span className="grid size-8 place-items-center rounded-md bg-ink text-white">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      Veriq
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile navigation (no JavaScript needed) */}
        <details className="group relative md:hidden">
          <summary
            className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-line text-ink [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <Menu className="size-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden size-5 group-open:block" aria-hidden="true" />
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 top-12 w-64 rounded-lg border border-line bg-white p-2 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-paper"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Link
                href="/login"
                className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-serif text-lg font-semibold">
            <ShieldCheck className="size-5" aria-hidden="true" />
            Veriq
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            Product verification for manufacturers and the people who buy
            their products.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/verify" className="text-white/85 hover:text-white">
            Verify a product
          </Link>
          <Link href="/login" className="text-white/85 hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="text-white/85 hover:text-white">
            Sign up
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto w-full max-w-6xl px-5 py-4 text-xs text-white/65 sm:px-8">
          © <CurrentYear /> Veriq. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${publicSans.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}