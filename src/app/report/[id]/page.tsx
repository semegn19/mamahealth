import type { Metadata } from "next";
import { AncReport } from "@/report/AncReport";

/** /report/<appointment-id> renders a specific ANC report. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AncReport reportId={decodeURIComponent(id)} />;
}

export const metadata: Metadata = { title: "ANC report — Mama Health" };
