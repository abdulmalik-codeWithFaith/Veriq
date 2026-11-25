import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "../../verify/verify-form";

// The widget that companies place on their own websites (inside an iframe).
export const metadata: Metadata = {
  title: "Verify your product",
  robots: { index: false },
};

export default function EmbedVerifyPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      {/* Hides the Veriq header and footer, so only the checker shows on the company's website. */}
      <style>{"[data-site-chrome]{display:none!important}"}</style>
      <Suspense fallback={<p className="text-muted">Loading</p>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}