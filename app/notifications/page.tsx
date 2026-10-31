import type { Metadata } from "next";
import { NotificationsPage } from "../../src/notifications/NotificationsPage";

export default function Page() {
  return <NotificationsPage />;
}

export const metadata: Metadata = { title: "Notifications — Mama Health" };
