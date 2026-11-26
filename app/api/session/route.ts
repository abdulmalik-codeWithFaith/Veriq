import { getSession } from "@/lib/auth/session";
import { readFile } from "@/lib/companies";

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

  const file = await readFile(uid, fileId);
  if (!file) return new Response("Not found", { status: 404 });

  const name = file.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}