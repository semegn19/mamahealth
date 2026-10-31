import type { Metadata } from "next";
import { AncReport } from "@/report/AncReport";

/** /report shows the most recent (third) appointment. */
export default function Page() {
  return <AncReport reportId="third-appointment" />;
}

export const metadata: Metadata = {
  title: "Latest ANC Report — Mama Health",
  description: "Review your latest antenatal check-in summary and health metrics.",
};
