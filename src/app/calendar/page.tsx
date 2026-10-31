import type { Metadata } from "next";
import { CalendarPage } from "@/calendar/CalendarPage";

export default function Page() {
  return <CalendarPage />;
}

export const metadata: Metadata = { title: "Journey — Mama Health" };
