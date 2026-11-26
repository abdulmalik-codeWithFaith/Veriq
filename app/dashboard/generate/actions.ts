"use server";

import { requireApprovedCompany } from "@/lib/auth/session";
import { createCodes } from "@/lib/codes";

export async function generateCodes(input: {
  product: string;
  details: string;
  quantity: number;
}): Promise<{ codes: string[] }> {
  const session = await requireApprovedCompany();

  const product = String(input.product ?? "").trim();
  const details = String(input.details ?? "").trim();
  const quantity = Number(input.quantity);
  if (!product || product.length > 100) throw new Error("Enter the product name.");
  if (details.length > 300) throw new Error("The product information is too long.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) throw new Error("Choose 1 to 1000 codes.");

  return { codes: await createCodes(session.uid, { product, details, quantity }) };
}