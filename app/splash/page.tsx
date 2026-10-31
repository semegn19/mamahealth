import type { Metadata } from "next";
import { SplashPage } from "../../src/auth/SplashPage";

export default function Page() {
  return <SplashPage />;
}

export const metadata: Metadata = { title: "Preparing your space — Mama Health" };
