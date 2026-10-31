"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextDotFillButton } from "../components/NextDotFillButton";

export function LandingHeroCTA() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/home");
  }, [router]);

  return (
    <div className="flex items-center">
      <NextDotFillButton
        label="Begin your journey"
        onMouseEnter={() => router.prefetch("/login")}
        onClick={() => {
          router.push("/login");
        }}
      />
    </div>
  );
}
