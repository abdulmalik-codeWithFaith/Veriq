"use client";

import { usePathname } from "next/navigation";

/** Hides the site header and footer on /embed pages, so the widget looks clean on other websites. */
export function HideOnEmbed({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/embed")) return null;
  return <>{children}</>;
}