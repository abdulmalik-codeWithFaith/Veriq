import Link from "next/link";
import { getViewer } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

/** The right side of the header. It changes depending on whether someone is logged in. */
export async function AuthActions({ variant }: { variant: "desktop" | "mobile" }) {
  const viewer = await getViewer();
  const home = viewer?.role === "admin" ? { href: "/admin", label: "Admin" } : { href: "/dashboard", label: "Dashboard" };

  if (variant === "desktop") {
    return (
      <div className="hidden items-center gap-2 md:flex">
        {viewer ? (
          <>
            <Link
              href={home.href}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {home.label}
            </Link>
            <LogoutButton className="rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-60" />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 border-t border-line pt-3">
      {viewer?.email && <p className="mb-2 truncate px-1 text-xs text-muted">Signed in as {viewer.email}</p>}
      <div className="grid grid-cols-2 gap-2">
        {viewer ? (
          <>
            <Link
              href={home.href}
              className="rounded-md bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {home.label}
            </Link>
            <LogoutButton className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink disabled:opacity-60" />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}