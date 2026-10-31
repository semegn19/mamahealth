"use client";

import { useTranslation } from "@/components/languageStore";

export function LearnMoreButton() {
  const { t } = useTranslation();

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("mama-health-open-journey-modal"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group mt-7 inline-flex items-center gap-2 rounded-full text-[14px] text-[#8d6a2a] outline-none transition-colors duration-500 hover:text-[#4a3f30] focus-visible:ring-2 focus-visible:ring-[#caa152] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5eee0] dark:text-[#e5be79] dark:hover:text-[#f5ede0] dark:focus-visible:ring-offset-[#15120e]"
    >
      {t("landing.learnMore")}
      <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
