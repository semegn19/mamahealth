import type { Metadata } from "next";
import { NotificationsPage } from "@/notifications/NotificationsPage";

export default function Page() {
  return <NotificationsPage />;
}

export const metadata: Metadata = { title: "Notifications — Mama Health" };
