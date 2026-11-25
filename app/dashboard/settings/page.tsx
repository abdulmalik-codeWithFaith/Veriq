import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApprovedCompany } from "@/lib/auth/session";
import { getCompany } from "@/lib/companies";
import { SharePanel } from "./share-panel";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireApprovedCompany();
  const company = await getCompany(session.uid);
  if (!company) notFound();

  const profile = [
    { label: "Business name", value: company.businessName },
    { label: "Business email", value: company.email },
    { label: "Phone number", value: company.phone },
    { label: "Product category", value: company.category },
    { label: "Website", value: company.website ?? "Not provided" },
  ];

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-semibold">Settings</h2>
      <p className="mt-2 text-muted">
        Show your customers where to check their products.
      </p>

      <SharePanel slug={company.slug} />

      <section className="mt-12 border-t-2 border-ink pt-5">
        <h3 className="font-serif text-xl font-semibold">Company details</h3>
        <dl className="mt-4 divide-y divide-line rounded-lg border border-line bg-white">
          {profile.map(({ label, value }) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
        {/* TODO: add an edit form, and a way to change the logo. */}
        <p className="mt-3 text-sm text-muted">
          These details were reviewed when you applied. To change them, contact support.
        </p>
      </section>
    </div>
  );
}