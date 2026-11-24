import type { Metadata } from "next";
import { GenerateForm } from "./generate-form";

export const metadata: Metadata = { title: "Generate codes" };

export default function GeneratePage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl font-semibold">Generate codes</h2>
      <p className="mt-2 text-muted">
        Create a batch of unique codes for one product. Customers see the product name
        and details you enter here when they verify a code.
      </p>
      <GenerateForm />
    </div>
  );
}