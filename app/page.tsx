import type { Metadata } from "next";
import { LandingPage } from "../src/landing/LandingPage";

export default function Page() {
  return <LandingPage />;
}

export const metadata: Metadata = {
  title: "Mama Health — Gentle care for every stage of motherhood",
};
