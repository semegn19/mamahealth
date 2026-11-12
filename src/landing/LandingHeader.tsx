"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTranslation } from "../components/languageStore";

const NAV_KEYS = [
  { key: "welcome", labelKey: "nav.welcome", target: "welcome" },
  { key: "care", labelKey: "nav.care", target: "care" },
  { key: "journey", labelKey: "nav.calendar", target: "journey" },
  { key: "contact", labelKey: "nav.contact", target: "contact" },
] as const;

export function LandingHeader() {
  const { t } = useTranslation();
  const [active, setActive] = useState("welcome");
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (target: string, key: string) => {
    setActive(key);
    setMenuOpen(false);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="flex items-start justify-between gap-6 lg:max-w-[64%] xl:max-w-[60%] 2xl:max-w-[56%]">
        <nav className="hidden sm:block">
          <ul className="space-y-0.5 text-[15px] leading-snug">
            {NAV_KEYS.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => goTo(item.target, item.key)}
                  className={`transition-colors duration-300 ${
                    active === item.key
                      ? "font-medium text-[#4a3f30] dark:text-[#f5ede0]"
                      : "text-[#a99d89] hover:text-[#7a6a50] dark:text-[#8f7f67] dark:hover:text-[#d8c7ab]"
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="text-sm text-[#4a3f30] sm:hidden dark:text-[#f5ede0]"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? t("common.close") : t("nav.menu")}
        </button>

        <a
          href="#"
          className="text-[17px] font-medium tracking-tight text-[#4a3f30] dark:text-[#f5ede0]"
        >
          Mama Health
        </a>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            prefetch={true}
            className="rounded-full bg-white/90 px-5 py-2.5 text-[13px] font-medium text-[#3d3326] shadow-[0_8px_30px_-10px_rgba(180,140,70,0.45)] backdrop-blur transition hover:bg-white hover:shadow-[0_12px_40px_-10px_rgba(180,140,70,0.6)] dark:border dark:border-[#e5be79]/28 dark:bg-[#2a2118]/90 dark:text-[#f5ede0] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] dark:hover:bg-[#352a1e]"
          >
            {t("nav.waitlist")}
          </Link>
        </div>
      </header>

      {menuOpen && (
        <ul className="mt-4 space-y-2 rounded-2xl bg-white/50 p-4 backdrop-blur-lg sm:hidden dark:border dark:border-[#e5be79]/18 dark:bg-[#231c15]/90">
          {NAV_KEYS.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => goTo(item.target, item.key)}
                className={`block w-full text-left py-1 text-sm ${
                  active === item.key
                    ? "font-medium text-[#4a3f30] dark:text-[#f5ede0]"
                    : "text-[#a99d89] dark:text-[#9c8b72]"
                }`}
              >
                {t(item.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
