import type { Metadata } from "next";
import { AncReport } from "../../src/report/AncReport";

/** /report shows the most recent (third) appointment. */
export default function Page() {
  return <AncReport reportId="third-appointment" />;
}

export const metadata: Metadata = { title: "ANC report — Mama Health" };
