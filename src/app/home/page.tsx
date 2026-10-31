import type { Metadata } from "next";
import { HomeDashboard } from "@/home/HomeDashboard";

export default function Page() {
  return <HomeDashboard />;
}

export const metadata: Metadata = { title: "Home — Mama Health" };
