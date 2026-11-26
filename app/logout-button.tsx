"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
    } finally {
      router.push("/");
      router.refresh(); // so the header shows the logged-out links
    }
  }

  return (
    <button type="button" onClick={logout} disabled={busy} className={className}>
      {busy ? "Logging out" : "Log out"}
    </button>
  );
}