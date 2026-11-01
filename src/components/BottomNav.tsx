"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, Home, ListChecks, Mic } from "lucide-react";
import { useTranslation } from "./languageStore";

export type NavKey = "home" | "calendar" | "report" | "checkin";

const NAV_DESTINATIONS: Record<NavKey, string> = {
  home: "/home",
  calendar: "/calendar",
  report: "/reports",
  checkin: "/logs",
};

export function BottomNav({ current }: { current?: NavKey }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const inferredCurrent: NavKey =
    current ??
    (pathname?.startsWith("/calendar")
      ? "calendar"
      : pathname?.startsWith("/report")
        ? "report"
        : pathname?.startsWith("/logs")
          ? "checkin"
          : "home");

  const [active, setActive] = useState<NavKey>(inferredCurrent);

  useEffect(() => {
    setActive(inferredCurrent);
  }, [inferredCurrent]);

  const [overCards, setOverCards] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const measureOverlap = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pill = pillRef.current;
        if (!pill) return;

        const navRect = pill.getBoundingClientRect();
        const cards = document.querySelectorAll<HTMLElement>("[data-dashboard-card]");
        if (cards.length === 0) {
          setOverCards(false);
          return;
        }

        const overlaps = Array.from(cards).some((card) => {
          const cardRect = card.getBoundingClientRect();
          return (
            navRect.left < cardRect.right &&
            navRect.right > cardRect.left &&
            navRect.top < cardRect.bottom &&
            navRect.bottom > cardRect.top
          );
        });

        setOverCards(overlaps);
      });
    };

    measureOverlap();
    window.addEventListener("scroll", measureOverlap, { passive: true });
    window.addEventListener("resize", measureOverlap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measureOverlap);
      window.removeEventListener("resize", measureOverlap);
    };
  }, []);

  const navItem = (key: NavKey, label: string, icon: React.ReactNode) => {
    const isActive = active === key;
    const href = NAV_DESTINATIONS[key];
    const isCurrentPage = pathname === href;

    return (
      <Link
        key={key}
        href={href}
        prefetch={true}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        onClick={(e) => {
          if (isCurrentPage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          setActive(key);
        }}
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
          isActive
            ? "bg-[#eed7a6] text-[#2c2010] shadow-[0_10px_22px_-12px_rgba(140,96,30,0.75)] dark:bg-[#8d6a2a] dark:text-[#fdf2da] dark:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.85)]"
            : "bg-white/45 text-[#4a3f30] hover:bg-white/70 dark:bg-white/8 dark:text-[#e6dbca] dark:hover:bg-white/14"
        }`}
      >
        {icon}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <div
        ref={pillRef}
        className={`flex items-center gap-2.5 rounded-full p-2 transition-[background-color,border-color,box-shadow] duration-300 ${
          overCards ? "home-nav-overlap" : "home-nav-clear"
        }`}
      >
        {navItem("home", t("nav.home"), <Home size={19} strokeWidth={1.9} />)}
        {navItem("calendar", t("nav.calendar"), <CalendarDays size={19} strokeWidth={1.8} />)}

        {/* Voice assistant */}
        <Link
          href="/voice"
          prefetch={true}
          aria-label={t("voice.title")}
          className="relative mx-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] shadow-[0_10px_24px_-10px_rgba(60,45,25,0.7)] transition active:scale-95 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_10px_26px_-8px_rgba(229,190,121,0.45)]"
        >
          <Mic size={24} strokeWidth={1.9} className="relative" />
        </Link>

        {navItem("report", t("nav.reports"), <FileText size={19} strokeWidth={1.8} />)}
        {navItem("checkin", t("nav.logs"), <ListChecks size={19} strokeWidth={1.8} />)}
      </div>
    </nav>
  );
}
