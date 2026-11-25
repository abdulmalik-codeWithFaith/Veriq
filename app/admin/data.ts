import "server-only";
import { fileUrl, getCompany, listCompanies, type Company } from "@/lib/companies";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Application = {
  id: string;
  businessName: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  category: string;
  status: ApplicationStatus;
  submittedAt: string; // ISO date
  rejectionReason?: string;
  logoUrl?: string; // admin-only link
  documents: { name: string; size: string; href: string }[]; // admin-only links
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function base(c: Company): Application {
  return {
    id: c.id,
    businessName: c.businessName,
    address: c.address,
    email: c.email,
    phone: c.phone,
    website: c.website,
    category: c.category,
    status: c.status as ApplicationStatus,
    submittedAt: c.submittedAt ?? "",
    rejectionReason: c.rejectionReason,
    documents: [],
  };
}

export async function getApplications(): Promise<Application[]> {
  return (await listCompanies()).map(base);
}

export async function getApplication(id: string): Promise<Application | undefined> {
  const c = await getCompany(id);
  if (!c || c.status === "incomplete") return undefined;

  const documents = c.documents.map((d) => ({
    name: d.name,
    size: formatSize(d.size),
    href: fileUrl(c.id, d.path),
  }));
  const logoUrl = c.logoPath ? fileUrl(c.id, c.logoPath) : undefined;
  return { ...base(c), documents, logoUrl };
}

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-soft text-amber",
  approved: "bg-seal-soft text-seal",
  rejected: "bg-danger-soft text-danger",
};