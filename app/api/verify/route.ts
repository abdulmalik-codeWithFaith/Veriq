import { NextResponse } from "next/server";
import { CODE_RE, normalizeCode, verifyCode } from "@/lib/codes";
import { clientKey, isBlocked, recordInvalid } from "@/lib/rateLimit";

// The public check a customer makes. No login needed.
export async function POST(request: Request) {
  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.slice(0, 40) : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const key = clientKey(request.headers);
  try {
    if (await isBlocked(key)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

    const result = await verifyCode(code);
    // A well-formed code that does not exist looks like guessing, so it counts against this visitor.
    if (result.status === "invalid" && CODE_RE.test(normalizeCode(code))) await recordInvalid(key);

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("verify failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}