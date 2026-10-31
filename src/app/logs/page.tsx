import type { Metadata } from "next";
import { CheckinLogs } from "@/logs/CheckinLogs";

export default function Page() {
  return <CheckinLogs />;
}

export const metadata: Metadata = { title: "Check-in logs — Mama Health" };
