import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { categories } from "@/lib/categories";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const DOC_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_LOGO = 1_000_000;
const MAX_DOC = 3_000_000;
const MAX_TOTAL = 4_000_000; // Vercel rejects requests over about 4.5 MB
const MAX_DOCS = 5;
const CHUNK = 800_000; // a Firestore document can hold at most 1 MiB, so big files are split

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Looks at the first bytes of the file, so a renamed file can't pretend to be something else. */
function sniff(b: Buffer): { type: string; ext: string } | null {
  if (b.subarray(0, 4).toString("latin1") === "%PDF") return { type: "application/pdf", ext: "pdf" };
  if (b[0] === 0x89 && b.subarray(1, 4).toString("latin1") === "PNG") return { type: "image/png", ext: "png" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP")
    return { type: "image/webp", ext: "webp" };
  return null;
}

/** Saves one file as a small record plus numbered chunks, in companies/{uid}/files/{fileId}. */
async function saveFile(
  uid: string,
  fileId: string,
  buf: Buffer,
  meta: { name: string; contentType: string },
) {
  const db = adminDb();
  const fileRef = db.collection("companies").doc(uid).collection("files").doc(fileId);
  const chunks = Math.ceil(buf.length / CHUNK);
  const batch = db.batch();
  for (let i = 0; i < chunks; i++) {
    batch.set(fileRef.collection("chunks").doc(String(i)), { data: buf.subarray(i * CHUNK, (i + 1) * CHUNK) });
  }
  batch.set(fileRef, { ...meta, size: buf.length, chunks });
  await batch.commit();
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "company";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "company") return fail("Please log in again.", 401);
  if (session.status !== "incomplete" && session.status !== "rejected")
    return fail("Your application has already been sent.", 409);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("We couldn’t read your form. Try again.");
  }

  const text = (key: string) => String(form.get(key) ?? "").trim();
  const businessName = text("name");
  const address = text("address");
  const businessEmail = text("email");
  const phone = text("phone");
  const website = text("website");
  const category = text("category");

  if (!businessName || businessName.length > 120) return fail("Enter your business name.");
  if (!address || address.length > 300) return fail("Enter your business address.");
  if (!/^\S+@\S+\.\S+$/.test(businessEmail) || businessEmail.length > 200) return fail("Enter a valid business email.");
  if (phone.replace(/\D/g, "").length < 7 || phone.length > 30) return fail("Enter a valid phone number.");
  if (website.length > 200) return fail("The website address is too long.");
  if (!categories.includes(category)) return fail("Choose a product category.");

  const logoFile = form.get("logo");
  const docFiles = form.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
  if (!(logoFile instanceof File) || logoFile.size === 0) return fail("Upload your business logo.");
  if (docFiles.length === 0) return fail("Upload at least one verification document.");
  if (docFiles.length > MAX_DOCS) return fail(`You can upload up to ${MAX_DOCS} documents.`);

  const logoBuf = Buffer.from(await logoFile.arrayBuffer());
  const docBufs = await Promise.all(docFiles.map(async (f) => Buffer.from(await f.arrayBuffer())));

  const logoKind = sniff(logoBuf);
  if (!logoKind || !LOGO_TYPES.includes(logoKind.type)) return fail("The logo must be a PNG, JPG or WebP image.");
  if (logoBuf.length > MAX_LOGO) return fail("The logo is too large. Use an image under 1 MB.");

  const docKinds = docBufs.map(sniff);
  if (docKinds.some((k) => !k || !DOC_TYPES.includes(k.type))) return fail("Documents must be PDF, PNG or JPG files.");
  if (docBufs.some((b) => b.length > MAX_DOC)) return fail("A document is larger than 3 MB.");
  if (logoBuf.length + docBufs.reduce((n, b) => n + b.length, 0) > MAX_TOTAL)
    return fail("Your files add up to more than 4 MB. Use smaller files.");

  try {
    const uid = session.uid;
    const db = adminDb();

    // Re-applying after a rejection: remove the old files first.
    await db.recursiveDelete(db.collection("companies").doc(uid).collection("files"));

    const logoPath = "logo";
    await saveFile(uid, logoPath, logoBuf, { name: logoFile.name.slice(0, 120), contentType: logoKind.type });

    const documents = await Promise.all(
      docBufs.map(async (buf, i) => {
        const kind = docKinds[i]!;
        const path = `doc-${i + 1}`;
        const name = docFiles[i].name.slice(0, 120);
        await saveFile(uid, path, buf, { name, contentType: kind.type });
        return { name, path, size: buf.length, contentType: kind.type };
      }),
    );

    const ref = db.collection("companies").doc(uid);
    const existing = await ref.get();
    const slug = existing.get("slug") ?? `${slugify(businessName)}-${session.uid.slice(0, 6).toLowerCase()}`;

    await ref.set(
      {
        businessName,
        address,
        businessEmail,
        phone,
        website: website || FieldValue.delete(),
        category,
        slug,
        logoPath,
        documents,
        status: "pending",
        submittedAt: FieldValue.serverTimestamp(),
        rejectionReason: FieldValue.delete(),
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("onboarding failed", err);
    return fail("We couldn’t save your application. Try again in a moment.", 500);
  }
}