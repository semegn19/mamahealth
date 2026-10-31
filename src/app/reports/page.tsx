import type { Metadata } from "next";
import { ReportsList } from "@/report/ReportsList";

export default function Page() {
  return <ReportsList />;
}

export const metadata: Metadata = { title: "ANC reports — Mama Health" };
