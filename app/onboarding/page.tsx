import type { Metadata } from "next";
import { OnboardingPage } from "../../src/onboarding/OnboardingPage";

export default function Page() {
  return <OnboardingPage />;
}

export const metadata: Metadata = { title: "Set up your care — Mama Health" };
