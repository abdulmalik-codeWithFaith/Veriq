import "server-only";
import type { Timestamp } from "firebase-admin/firestore";
import type { CompanyStatus } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";

// path is the file id inside companies/{uid}/files (for example "doc-1")
export type StoredDocument = { name: string; path: string; size: number; contentType: string };

export type Company = {
  id: string; // same as the Firebase user id
  ownerName: string;
  accountEmail: string;
  businessName: string;
  address: string;
  email: string; // business email
  phone: string;
  website?: string;
  category: string;
  slug: string;
  status: CompanyStatus;
  submittedAt?: string; // ISO date
  rejectionReason?: string;
  logoPath?: string;
  documents: StoredDocument[];
};

function iso(value: unknown): string | undefined {
  const v = value as Timestamp | undefined;
  return v && typeof v.toDate === "function" ? v.toDate().toISOString() : undefined;
}

function fromDoc(id: string, d: FirebaseFirestore.DocumentData): Company {
  return {
    id,
    ownerName: d.ownerName ?? "",
    accountEmail: d.email ?? "",
    businessName: d.businessName ?? "",
    address: d.address ?? "",
    email: d.businessEmail ?? "",
    phone: d.phone ?? "",
    website: d.website || undefined,
    category: d.category ?? "",
    slug: d.slug ?? "",
    status: (d.status as CompanyStatus) ?? "incomplete",
    submittedAt: iso(d.submittedAt),
    rejectionReason: d.rejectionReason || undefined,
    logoPath: d.logoPath || undefined,
    documents: Array.isArray(d.documents) ? (d.documents as StoredDocument[]) : [],
  };
}

export async function getCompany(uid: string): Promise<Company | null> {
  try {
    const snap = await adminDb().collection("companies").doc(uid).get();
    return snap.exists ? fromDoc(snap.id, snap.data()!) : null;
  } catch {
    return null;
  }
}

/** Every company that has sent its business form, newest first. */
export async function listCompanies(): Promise<Company[]> {
  // Fine for hundreds of companies. If it grows a lot, add a Firestore query with an index.
  const snap = await adminDb().collection("companies").get();
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .filter((c) => c.status !== "incomplete")
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
}

/**
 * Files (logo and documents) live in Firestore, in companies/{uid}/files/{fileId}.
 * They are only served to the admin, through this route.
 */
export function fileUrl(uid: string, fileId: string): string {
  return `/api/admin/files/${uid}/${fileId}`;
}