import type { Metadata } from "next";
import { AuthPage } from "../../src/auth/AuthPage";

export default function Page() {
  return <AuthPage initialMode="register" />;
}

export const metadata: Metadata = { title: "Create your account — Mama Health" };
