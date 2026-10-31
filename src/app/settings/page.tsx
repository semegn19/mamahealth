import type { Metadata } from "next";
import { SettingsPage } from "@/settings/SettingsPage";

export default function Page() {
  return <SettingsPage />;
}

export const metadata: Metadata = { title: "Settings — Mama Health" };
