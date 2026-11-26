import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE, destinationFor, resolveSession } from "@/lib/auth/session";

// Turns a fresh Firebase sign-in into a secure session cookie.
export async function POST(request: Request) {
  let body: { idToken?: string; name?: string } | null;
  try {
    body = await request.json();
  } catch {
    console.error("session: the request body was empty or not JSON", {
      contentType: request.headers.get("content-type"),
    });
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body?.idToken) {
    console.error("session: no idToken in the request", { received: Object.keys(body ?? {}) });
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(body.idToken, true);

    // Only accept a sign-in that just happened (within 5 minutes).
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
    }

    // First time we see a company account: create its record.
    if (decoded.admin !== true) {
      const ref = adminDb().collection("companies").doc(decoded.uid);
      if (!(await ref.get()).exists) {
        await ref.set({
          ownerName: (body.name ?? "").trim().slice(0, 100),
          email: decoded.email ?? "",
          status: "incomplete",
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    const sessionCookie = await adminAuth().createSessionCookie(body.idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({ destination: destinationFor(await resolveSession(decoded)) });
  } catch (err) {
    console.error("session: sign-in failed", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "sign_in_failed", detail: process.env.NODE_ENV === "development" ? detail : undefined },
      { status: 401 },
    );
  }
}

// Log out.
export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}