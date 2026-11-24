/*
  SAMPLE DATA ONLY. Replace these helpers with real database queries.
  Keep the same shapes so the pages keep working.
*/

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
  documents: { name: string; size: string; href: string }[]; // href = private, signed URL
};

const applications: Application[] = [
  {
    id: "app_1",
    businessName: "Greenfield Beverages Ltd",
    address: "12 Industrial Road, Ibadan, Oyo State",
    email: "info@greenfield.example",
    phone: "+234 800 000 0001",
    website: "www.greenfield.example",
    category: "Food and beverages",
    status: "pending",
    submittedAt: "2026-11-22T09:30:00Z",
    documents: [
      { name: "business-registration.pdf", size: "1.2 MB", href: "#" },
      { name: "product-registration.pdf", size: "860 KB", href: "#" },
    ],
  },
  {
    id: "app_2",
    businessName: "Sunrise Cosmetics Nigeria",
    address: "5 Market Street, Lagos",
    email: "hello@sunrise.example",
    phone: "+234 800 000 0002",
    category: "Cosmetics and personal care",
    status: "pending",
    submittedAt: "2026-11-23T14:05:00Z",
    documents: [{ name: "certificate.pdf", size: "2.1 MB", href: "#" }],
  },
  {
    id: "app_3",
    businessName: "Northern Agro Supplies",
    address: "8 Farm Lane, Kano",
    email: "office@northernagro.example",
    phone: "+234 800 000 0003",
    category: "Agrochemicals and fertilizers",
    status: "approved",
    submittedAt: "2026-11-15T11:00:00Z",
    documents: [{ name: "registration.pdf", size: "1.0 MB", href: "#" }],
  },
  {
    id: "app_4",
    businessName: "Quickfix Auto Parts",
    address: "21 Garage Close, Abuja",
    email: "sales@quickfix.example",
    phone: "+234 800 000 0004",
    category: "Auto parts",
    status: "rejected",
    submittedAt: "2026-11-10T08:15:00Z",
    rejectionReason: "The business registration document was unclear. Upload a clear copy and apply again.",
    documents: [{ name: "scan.jpg", size: "3.4 MB", href: "#" }],
  },
];

export async function getApplications(): Promise<Application[]> {
  return applications;
}

export async function getApplication(id: string): Promise<Application | undefined> {
  return applications.find((a) => a.id === id);
}

export function formatDate(iso: string) {
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