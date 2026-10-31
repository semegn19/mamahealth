"use client";

import { useTranslation } from "../components/languageStore";

export function LandingHeroHeadline() {
  const { t } = useTranslation();

  return (
    <h1 className="text-[18vw] font-medium leading-[0.82] tracking-[-0.04em] sm:text-[13vw] lg:text-[8.2vw] 2xl:text-[132px]">
      <span
        className="rise block text-[#4a3f30] dark:text-[#f5ede0]"
        style={{ animationDelay: "0.1s" }}
      >
        {t("landing.were")}
      </span>
      <span
        className="rise block text-[#c9b489] dark:text-[#c9a35d]"
        style={{ animationDelay: "0.25s" }}
      >
        {t("landing.growing")}
      </span>
      <span className="rise relative inline-block" style={{ animationDelay: "0.4s" }}>
        <span className="gold-shimmer drop-shadow-[0_2px_20px_rgba(201,160,90,0.35)]">
          {t("landing.together")}
        </span>
        <span className="absolute -bottom-2 left-0 h-[5px] w-[62%] rounded-full bg-white/95 dark:bg-[#e5be79]/90" />
      </span>
    </h1>
  );
}
