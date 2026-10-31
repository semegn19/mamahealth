import type { Metadata } from "next";
import { SettingsPage } from "../../src/settings/SettingsPage";

export default function Page() {
  return <SettingsPage />;
}

export const metadata: Metadata = { title: "Settings — Mama Health" };
