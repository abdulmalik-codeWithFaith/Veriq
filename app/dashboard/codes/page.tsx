import type { Metadata } from "next";
import { getCodes } from "../data";
import { CodesTable } from "./codes-table";

export const metadata: Metadata = { title: "Codes" };

export default async function CodesPage() {
  const codes = await getCodes();
  return (
    <>
      <h2 className="font-serif text-2xl font-semibold">Your codes</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Copying a code only marks it as copied. It stays valid, and customers can still verify it.
      </p>
      <CodesTable initialCodes={codes} />
    </>
  );
}