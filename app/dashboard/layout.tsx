import { getCompany } from "./data";
import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: protect every dashboard page on the server.
  // Only signed-in companies with status "approved" may open them.
  const company = await getCompany();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <p className="text-sm font-semibold text-muted">Manufacturer dashboard</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {company.name}
      </h1>
      <div className="mt-6">
        <DashboardNav />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}