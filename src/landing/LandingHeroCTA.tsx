"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextDotFillButton } from "../components/NextDotFillButton";
import { useTranslation } from "../components/languageStore";

export function LandingHeroCTA() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/home");
  }, [router]);

  return (
    <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between lg:max-w-[58%] xl:max-w-[56%] 2xl:max-w-[54%]">
      <div className="flex items-center">
        <NextDotFillButton
          label={t("landing.cta")}
          onMouseEnter={() => router.prefetch("/login")}
          onClick={() => {
            router.push("/login");
          }}
        />
      </div>

      <p className="max-w-[440px] text-[13.5px] leading-relaxed text-[#ad9f86] sm:text-right dark:text-[#9c8b72]">
        {t("landing.heroSub")}
      </p>
    </div>
  );
}
