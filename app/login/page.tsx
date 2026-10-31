import type { Metadata } from "next";
import { AuthPage } from "../../src/auth/AuthPage";

export default function Page() {
  return <AuthPage initialMode="login" />;
}

export const metadata: Metadata = { title: "Sign in — Mama Health" };
