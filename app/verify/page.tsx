import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Verify a product",
  description: "Enter a product code or scan its QR code to check that the product is genuine.",
};

export default function VerifyPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12 sm:py-16">
      <Suspense fallback={<p className="text-muted">Loading</p>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}