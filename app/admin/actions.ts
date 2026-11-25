"use server";

import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";

async function decide(id: string, update: Record<string, unknown>) {
  const admin = await requireAdmin();
  const db = adminDb();
  const ref = db.collection("companies").doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("status") !== "pending") {
      throw new Error("This application is not waiting for review.");
    }
    tx.update(ref, { ...update, reviewedAt: FieldValue.serverTimestamp(), reviewedBy: admin.uid });
  });
}

export async function approveCompany(id: string) {
  await decide(id, { status: "approved", rejectionReason: FieldValue.delete() });
  // TODO: email the company that it was approved and can log in.
}

export async function rejectCompany(id: string, reason: string) {
  const clean = reason.trim().slice(0, 500);
  if (!clean) throw new Error("A reason is required.");
  await decide(id, { status: "rejected", rejectionReason: clean });
  // TODO: email the company the reason.
}