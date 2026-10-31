"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = ["Welcome", "Care", "Journey", "Contact"] as const;

/** Where each landing nav item should take you. */
const NAV_TARGETS: Record<(typeof navItems)[number], string> = {
  Welcome: "welcome",
  Care: "care",
  Journey: "journey",
  Contact: "contact",
};

export function LandingHeader() {
  const [active, setActive] = useState("Welcome");
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (item: (typeof navItems)[number]) => {
    setActive(item);
    setMenuOpen(false);
    document.getElementById(NAV_TARGETS[item])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="flex items-start justify-between gap-6 lg:max-w-[64%] xl:max-w-[60%] 2xl:max-w-[56%]">
        <nav className="hidden sm:block">
          <ul className="space-y-0.5 text-[15px] leading-snug">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => goTo(item)}
                  className={`transition-colors duration-300 ${
                    active === item
                      ? "font-medium text-[#4a3f30] dark:text-[#f5ede0]"
                      : "text-[#a99d89] hover:text-[#7a6a50] dark:text-[#8f7f67] dark:hover:text-[#d8c7ab]"
                  }`}
                >
                  {item}
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
          {menuOpen ? "Close" : "Menu"}
        </button>

        <a
          href="#"
          className="text-[17px] font-medium tracking-tight text-[#4a3f30] dark:text-[#f5ede0]"
        >
          Mama Health
        </a>

        <Link
          href="/home"
          prefetch={true}
          className="rounded-full bg-white/90 px-5 py-2.5 text-[13px] font-medium text-[#3d3326] shadow-[0_8px_30px_-10px_rgba(180,140,70,0.45)] backdrop-blur transition hover:bg-white hover:shadow-[0_12px_40px_-10px_rgba(180,140,70,0.6)] dark:border dark:border-[#e5be79]/28 dark:bg-[#2a2118]/90 dark:text-[#f5ede0] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] dark:hover:bg-[#352a1e]"
        >
          Join the waitlist
        </Link>
      </header>

      {menuOpen && (
        <ul className="mt-4 space-y-1 rounded-2xl bg-white/50 p-4 backdrop-blur-lg sm:hidden dark:border dark:border-[#e5be79]/18 dark:bg-[#231c15]/90">
          {navItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => goTo(item)}
                className={
                  active === item
                    ? "font-medium text-[#4a3f30] dark:text-[#f5ede0]"
                    : "text-[#a99d89] dark:text-[#9c8b72]"
                }
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
