import type { Metadata } from "next";
import { AncReport } from "@/report/AncReport";
import { getReportArchiveItem } from "@/report/reportCatalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const report = getReportArchiveItem(decodedId);
  return {
    title: `${report.appointment} — Mama Health ANC Report`,
    description: `Antenatal Care report for ${report.appointment} (${report.range}). ${report.summary}`,
  };
}

/** /report/<appointment-id> renders a specific ANC report. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AncReport reportId={decodeURIComponent(id)} />;
}
