import { getSession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";

// Lets the admin open a company's logo or document. Nobody else can.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uid: string; fileId: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new Response("Not allowed", { status: 403 });

  const { uid, fileId } = await params;
  if (!/^[A-Za-z0-9]{10,40}$/.test(uid) || !/^(logo|doc-[1-5])$/.test(fileId)) {
    return new Response("Not found", { status: 404 });
  }

  const db = adminDb();
  const fileRef = db.collection("companies").doc(uid).collection("files").doc(fileId);
  const meta = await fileRef.get();
  if (!meta.exists) return new Response("Not found", { status: 404 });

  const count = Number(meta.get("chunks")) || 0;
  const parts = count
    ? await db.getAll(...Array.from({ length: count }, (_, i) => fileRef.collection("chunks").doc(String(i))))
    : [];
  const body = Buffer.concat(parts.map((p) => Buffer.from(p.get("data") as Uint8Array)));

  const name = String(meta.get("name") ?? fileId).replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": String(meta.get("contentType") ?? "application/octet-stream"),
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}