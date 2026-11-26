"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Search } from "lucide-react";
import { codeStatus, formatDate, type Code, type CodeStatus } from "../data";
import { StatusBadge } from "../status-badge";
import { markCodeCopied } from "./actions";

type Filter = "all" | CodeStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unused", label: "Unused" },
  { value: "copied", label: "Copied" },
  { value: "used", label: "Used" },
];

export function CodesTable({ initialCodes, total }: { initialCodes: Code[]; total: number }) {
  const [codes, setCodes] = useState(initialCodes);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: codes.length, unused: 0, copied: 0, used: 0 };
    codes.forEach((x) => c[codeStatus(x)]++);
    return c;
  }, [codes]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes.filter(
      (c) =>
        (filter === "all" || codeStatus(c) === filter) &&
        (!q || c.code.toLowerCase().includes(q) || c.product.toLowerCase().includes(q)),
    );
  }, [codes, filter, query]);

  async function copy(c: Code) {
    try {
      await navigator.clipboard.writeText(c.code);
    } catch {
      setMessage("Couldn’t copy automatically. Select the code and copy it by hand.");
      return;
    }
    setCodes((prev) => prev.map((x) => (x.code === c.code ? { ...x, copied: true } : x)));
    setJustCopied(c.code);
    setMessage(`Copied ${c.code}`);
    setTimeout(() => setJustCopied((cur) => (cur === c.code ? null : cur)), 1500);
    try {
      await markCodeCopied(c.code);
    } catch {
      setMessage("Copied, but we couldn’t save the copied mark. Try again.");
    }
  }

  if (codes.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-dashed border-line bg-white p-8 text-center text-muted">
        No codes yet.{" "}
        <Link href="/dashboard/generate" className="font-semibold text-brand underline underline-offset-4">
          Generate your first batch
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.value ? "bg-ink text-white" : "border border-line bg-white text-ink hover:border-brand"
              }`}
            >
              {f.label} <span className="opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <label htmlFor="search" className="sr-only">Search codes or products</label>
          <Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted" aria-hidden="true" />
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code or product"
            className="h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-sm"
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{message}</p>
      {message.startsWith("Couldn") && (
        <p role="alert" className="mt-4 rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger">{message}</p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line bg-paper text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Code</th>
              <th scope="col" className="px-4 py-3 font-semibold">Product</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No codes match.</td></tr>
            )}
            {rows.map((c) => {
              const status = codeStatus(c);
              const expanded = open === c.code;
              return (
                <FragmentRow key={c.code}>
                  <tr>
                    <td className="px-4 py-3 font-mono font-semibold tracking-wider">{c.code}</td>
                    <td className="px-4 py-3 text-muted">{c.product}</td>
                    <td className="px-4 py-3"><StatusBadge status={status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copy(c)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 font-semibold hover:border-brand"
                        >
                          {justCopied === c.code ? (
                            <Check className="size-4 text-seal" aria-hidden="true" />
                          ) : (
                            <Copy className="size-4" aria-hidden="true" />
                          )}
                          {justCopied === c.code ? "Copied" : "Copy"}
                          <span className="sr-only"> {c.code}</span>
                        </button>
                        {status === "used" && (
                          <button
                            type="button"
                            onClick={() => setOpen(expanded ? null : c.code)}
                            aria-expanded={expanded}
                            className="rounded-md px-3 py-1.5 font-semibold text-brand underline underline-offset-4"
                          >
                            {expanded ? "Hide" : "View"}
                            <span className="sr-only"> details for {c.code}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-paper">
                      <td colSpan={4} className="px-4 py-3 text-muted">
                        Verified {c.verifiedCount} {c.verifiedCount === 1 ? "time" : "times"}
                        {c.lastVerifiedAt && <>. Last checked on {formatDate(c.lastVerifiedAt)}.</>}
                        {c.verifiedCount > 1 && <> Several checks can mean the code was copied onto fake products.</>}
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>
      {total > initialCodes.length && (
        <p className="mt-3 text-sm text-muted">
          Showing your latest {initialCodes.length.toLocaleString("en-GB")} of {total.toLocaleString("en-GB")} codes.
        </p>
      )}
    </div>
  );
}

// Groups two <tr> rows without adding extra DOM.
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}