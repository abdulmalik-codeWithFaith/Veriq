import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "veriq_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days, in seconds

// incomplete = account created, business form not sent yet
export type CompanyStatus = "incomplete" | "pending" | "approved" | "rejected";
export type Session = {
  uid: string;
  email: string;
  role: "admin" | "company";
  status: CompanyStatus | null; // null for the admin
};

/** Works out who this person is. The admin is a Firebase user with the custom claim admin: true. */
export async function resolveSession(decoded: DecodedIdToken): Promise<Session> {
  const email = decoded.email ?? "";
  if (decoded.admin === true) {
    return { uid: decoded.uid, email, role: "admin", status: null };
  }
  const snap = await adminDb().collection("companies").doc(decoded.uid).get();
  const status = (snap.get("status") as CompanyStatus | undefined) ?? "incomplete";
  return { uid: decoded.uid, email, role: "company", status };
}

/** Where a person belongs right now. */
export function destinationFor(s: Session): string {
  if (s.role === "admin") return "/admin";
  switch (s.status) {
    case "approved":
      return "/dashboard";
    case "pending":
      return "/pending";
    case "rejected":
      return "/rejected";
    default:
      return "/onboarding";
  }
}

/** Reads the session cookie and checks it with Firebase. Returns null if not signed in. */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return await resolveSession(decoded);
  } catch {
    return null;
  }
});

export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role !== "admin") redirect(destinationFor(s));
  return s;
}

export async function requireApprovedCompany() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role === "admin") redirect("/admin");
  if (s.status !== "approved") redirect(destinationFor(s));
  return s;
}

/** For pages like /onboarding that need any signed-in company. */
export async function requireCompany() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role === "admin") redirect("/admin");
  return s;
}