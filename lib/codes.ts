import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { Code } from "@/app/dashboard/data";

/*
  Where the data lives (Firestore):
    companies/{uid}/codes/{CODE}   one document per code: product, details, copied, verifiedCount, ...
    codeIndex/{CODE}               { companyId }, so a customer's check finds the owner with one read

  The three states stay separate: a code exists, it may be "copied" (a flag only),
  and it has a verifiedCount. Copying never counts as a customer using it.
*/

// No 0, O, 1, I or L, so codes are easy to read and type.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_RE = /^[A-HJKMNP-Z2-9]{8}$/;
const BATCH_SIZE = 200; // each code is 2 writes, and one Firestore batch allows 500

export const normalizeCode = (raw: string) => raw.replace(/\s+/g, "").toUpperCase();
const makeCode = () => Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const companyRef = (uid: string) => adminDb().collection("companies").doc(uid);
const codesCol = (uid: string) => companyRef(uid).collection("codes");

function iso(value: unknown): string | undefined {
  const v = value as Timestamp | undefined;
  return v && typeof v.toDate === "function" ? v.toDate().toISOString() : undefined;
}

/* ---------- Manufacturer side ---------- */

export async function getCodes(uid: string, limit = 200): Promise<Code[]> {
  const snap = await codesCol(uid).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => ({
    code: d.id,
    product: String(d.get("product") ?? ""),
    batch: String(d.get("batchId") ?? ""),
    createdAt: iso(d.get("createdAt")) ?? "",
    copied: d.get("copied") === true,
    verifiedCount: Number(d.get("verifiedCount")) || 0,
    lastVerifiedAt: iso(d.get("lastVerifiedAt")),
  }));
}

/** Counts use Firestore's count queries, so they stay correct and cheap. */
export async function getStats(uid: string) {
  const col = codesCol(uid);
  const [all, used, copied] = await Promise.all([
    col.count().get(),
    col.where("verifiedCount", ">", 0).count().get(),
    col.where("copied", "==", true).count().get(),
  ]);
  const total = all.data().count;
  const usedCount = used.data().count;
  return { total, used: usedCount, unused: total - usedCount, copied: copied.data().count };
}

export async function markCopied(uid: string, raw: string) {
  const code = normalizeCode(raw);
  if (!CODE_RE.test(code)) throw new Error("Invalid code");
  // Only the "copied" flag changes. Verification data is never touched here.
  await codesCol(uid).doc(code).update({ copied: true });
}

async function commitBatch(
  uid: string,
  size: number,
  batchId: string,
  input: { product: string; details: string },
): Promise<string[]> {
  const db = adminDb();
  for (let attempt = 0; attempt < 4; attempt++) {
    const codes = new Set<string>();
    while (codes.size < size) codes.add(makeCode());

    const batch = db.batch();
    for (const code of codes) {
      batch.create(db.collection("codeIndex").doc(code), { companyId: uid });
      batch.create(codesCol(uid).doc(code), {
        product: input.product,
        ...(input.details ? { details: input.details } : {}),
        batchId,
        copied: false,
        verifiedCount: 0,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    try {
      await batch.commit();
      return [...codes];
    } catch (err) {
      // 6 = ALREADY_EXISTS: one of the random codes was taken (very rare). Try a fresh set.
      if ((err as { code?: number }).code === 6) continue;
      throw err;
    }
  }
  throw new Error("Could not create unique codes");
}

export async function createCodes(
  uid: string,
  input: { product: string; details: string; quantity: number },
): Promise<string[]> {
  const batchId = randomUUID().slice(0, 8);
  const all: string[] = [];
  let remaining = input.quantity;
  while (remaining > 0) {
    const size = Math.min(remaining, BATCH_SIZE);
    all.push(...(await commitBatch(uid, size, batchId, input)));
    remaining -= size;
  }
  return all;
}

/* ---------- Customer side ---------- */

type Manufacturer = { name: string; logoUrl?: string };
type Product = { name: string; details?: string };
export type VerifyResult =
  | { status: "genuine"; manufacturer: Manufacturer; product: Product }
  | { status: "repeat"; count: number; manufacturer: Manufacturer; product: Product }
  | { status: "invalid" };

export async function verifyCode(raw: string): Promise<VerifyResult> {
  const code = normalizeCode(raw);
  if (!CODE_RE.test(code)) return { status: "invalid" };

  const db = adminDb();
  const index = await db.collection("codeIndex").doc(code).get();
  const companyId = index.get("companyId") as string | undefined;
  if (!companyId) return { status: "invalid" };

  const codeRef = codesCol(companyId).doc(code);
  const found = await db.runTransaction(async (tx) => {
    const snap = await tx.get(codeRef);
    if (!snap.exists) return null;
    const before = Number(snap.get("verifiedCount")) || 0;
    tx.update(codeRef, {
      verifiedCount: FieldValue.increment(1),
      lastVerifiedAt: FieldValue.serverTimestamp(),
      ...(before === 0 ? { firstVerifiedAt: FieldValue.serverTimestamp() } : {}),
    });
    return {
      before,
      product: String(snap.get("product") ?? ""),
      details: (snap.get("details") as string | undefined) || undefined,
    };
  });
  if (!found) return { status: "invalid" };

  const company = await companyRef(companyId).get();
  if (!company.exists) return { status: "invalid" };

  const manufacturer: Manufacturer = {
    name: String(company.get("businessName") ?? ""),
    logoUrl: company.get("logoPath") ? `/api/logo/${companyId}` : undefined,
  };
  const product: Product = { name: found.product, details: found.details };

  return found.before === 0
    ? { status: "genuine", manufacturer, product }
    : { status: "repeat", count: found.before + 1, manufacturer, product };
}