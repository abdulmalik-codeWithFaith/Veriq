"use server";

import { requireApprovedCompany } from "@/lib/auth/session";
import { markCopied } from "@/lib/codes";

// Marks a code as copied. This never affects whether customers can verify it.
export async function markCodeCopied(code: string) {
  const session = await requireApprovedCompany();
  await markCopied(session.uid, code);
}