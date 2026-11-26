import "server-only";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";

// Stops people guessing codes. Only wrong (but well-formed) codes count against a device.
const WINDOW_MS = 10 * 60_000; // 10 minutes
const MAX_INVALID = 10;
const KEEP_MS = 24 * 60 * 60_000; // records are removed about a day later (see the TTL note in the README)

/** A private fingerprint of the visitor. The real IP address is never stored. */
export function clientKey(headers: Headers): string {
  const ip = (headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "unknown").trim();
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

const ref = (key: string) => adminDb().collection("rateLimits").doc(key);

export async function isBlocked(key: string): Promise<boolean> {
  const snap = await ref(key).get();
  if (!snap.exists) return false;
  const windowStart = Number(snap.get("windowStart")) || 0;
  const count = Number(snap.get("count")) || 0;
  return Date.now() - windowStart < WINDOW_MS && count >= MAX_INVALID;
}

export async function recordInvalid(key: string) {
  const db = adminDb();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref(key));
    const now = Date.now();
    const windowStart = Number(snap.get("windowStart")) || 0;
    if (!snap.exists || now - windowStart >= WINDOW_MS) {
      tx.set(ref(key), { count: 1, windowStart: now, expireAt: new Date(now + KEEP_MS) });
    } else {
      tx.update(ref(key), { count: (Number(snap.get("count")) || 0) + 1, expireAt: new Date(now + KEEP_MS) });
    }
  });
}