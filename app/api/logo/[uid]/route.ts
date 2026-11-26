import { getCompany, readFile } from "@/lib/companies";

// A company's logo, shown to customers on the verification page. Only approved companies, only the logo.
export async function GET(_request: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  if (!/^[A-Za-z0-9]{10,40}$/.test(uid)) return new Response("Not found", { status: 404 });

  const company = await getCompany(uid);
  if (!company || company.status !== "approved" || !company.logoPath) {
    return new Response("Not found", { status: 404 });
  }

  const file = await readFile(uid, "logo");
  if (!file || !file.contentType.startsWith("image/")) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      // Cached so a busy product does not read the database every time.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}