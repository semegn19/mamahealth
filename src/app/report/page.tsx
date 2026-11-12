import type { Metadata } from "next";
import { AncReport } from "@/report/AncReport";

/** /report shows the most recent antenatal care report. */
export default function Page() {
  return <AncReport />;
}

export const metadata: Metadata = {
  title: "Latest ANC Report — Mama Health",
  description: "Review your latest antenatal check-in summary and health metrics.",
};
