import { Suspense } from "react";
import { requireApprovedCompany } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/companies";
import { DashboardNav } from "./dashboard-nav";

async function Shell({ children }: { children: React.ReactNode }) {
  // Only signed-in companies that you approved can get past this line.
  const session = await requireApprovedCompany();
  const company = await getCompany(session.uid);
  if (!company) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <p className="text-sm font-semibold text-muted">Manufacturer dashboard</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {company.businessName}
      </h1>
      <div className="mt-6">
        <DashboardNav />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="mx-auto w-full max-w-6xl px-5 py-12 text-muted sm:px-8">Loading your dashboard</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}