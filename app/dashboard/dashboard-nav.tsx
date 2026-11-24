"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/codes", label: "Codes" },
  { href: "/dashboard/generate", label: "Generate codes" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="-mx-5 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px block border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  active ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}