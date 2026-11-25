"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { approveCompany, rejectCompany } from "@/app/admin/actions";

export function ReviewActions({ id, businessName }: { id: string; businessName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function done() {
    router.push("/admin?status=pending");
    router.refresh();
  }

  async function onApprove() {
    setError("");
    setBusy("approve");
    try {
      await approveCompany(id);
      done();
    } catch {
      setError("We couldn’t approve this company. Try again.");
      setBusy(null);
    }
  }

  async function onReject(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Write a reason so the company knows what to fix.");
      return;
    }
    setError("");
    setBusy("reject");
    try {
      await rejectCompany(id, reason.trim());
      done();
    } catch {
      setError("We couldn’t reject this application. Try again.");
      setBusy(null);
    }
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-muted">
        Approving {businessName} sends it an email and opens its dashboard.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onApprove}
          disabled={busy !== null}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-seal px-6 text-base font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy === "approve" ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-5" aria-hidden="true" />
          )}
          Approve company
        </button>
        <button
          type="button"
          onClick={() => setRejecting((r) => !r)}
          disabled={busy !== null}
          aria-expanded={rejecting}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-danger bg-white px-6 text-base font-semibold text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-70"
        >
          <X className="size-5" aria-hidden="true" />
          Reject
        </button>
      </div>

      <AnimatePresence initial={false}>
        {rejecting && (
          <motion.form
            onSubmit={onReject}
            noValidate
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-5">
              <label htmlFor="reason" className="text-sm font-semibold">
                Reason for rejecting
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-describedby="reason-hint"
                className="mt-2 w-full rounded-md border border-line bg-white p-3 text-base"
              />
              <p id="reason-hint" className="mt-1.5 text-sm text-muted">
                The company will see this and can apply again.
              </p>
              <button
                type="submit"
                disabled={busy !== null}
                className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md bg-danger px-6 text-base font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy === "reject" && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
                Send rejection
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-4 rounded-md border-l-4 border-danger bg-danger-soft p-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}