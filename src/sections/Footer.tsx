"use client";

import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { useTranslation } from "@/components/languageStore";

/**
 * Footer: a full-bleed, soft landscape of rounded hills in light honey tones
 * (and quiet amber-bronze twilight hills in dark mode),
 * matching the rest of the page, with contact details on top.
 * No outer frame or bottom gap: the landscape runs to the edges of the screen.
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="relative w-full overflow-hidden bg-[#f5ecdb] dark:bg-[#14100c]">
      <div className="relative min-h-[480px] w-full sm:min-h-[540px]">
        {/* Landscape */}
        <svg
          viewBox="0 0 1440 540"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ft-main" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--ft-main-0)" }} />
              <stop offset="100%" style={{ stopColor: "var(--ft-main-1)" }} />
            </linearGradient>
            <linearGradient id="ft-ridge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--ft-ridge-0)" }} />
              <stop offset="100%" style={{ stopColor: "var(--ft-ridge-1)" }} />
            </linearGradient>
            <linearGradient id="ft-deep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--ft-deep-0)" }} />
              <stop offset="100%" style={{ stopColor: "var(--ft-deep-1)" }} />
            </linearGradient>
            <filter id="ft-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="20" />
            </filter>
          </defs>

          {/* Soft glowing halo behind the mound */}
          <g filter="url(#ft-blur)" className="opacity-90 dark:opacity-30">
            <path
              d="M 0 540 L 0 320 C 120 270 260 250 380 268 C 470 160 640 84 820 84 C 1000 84 1150 170 1220 280 C 1300 252 1380 260 1440 280 L 1440 540 Z"
              className="fill-[#fffaf0] dark:fill-[#c99642]"
            />
          </g>

          {/* Main mound */}
          <path
            d="M 0 540 L 0 344 C 110 296 250 278 370 296 C 450 186 620 106 810 106 C 1000 106 1150 196 1210 306 C 1290 278 1380 284 1440 306 L 1440 540 Z"
            fill="url(#ft-main)"
          />

          {/* Light rolling ridge */}
          <path
            d="M 220 540 C 260 460 330 402 420 412 C 520 422 580 490 680 480 C 790 468 830 352 930 332 C 1030 314 1090 400 1160 440 C 1230 478 1300 486 1440 470 L 1440 540 Z"
            fill="url(#ft-ridge)"
            opacity="0.92"
          />

          {/* Right-side soft hill */}
          <path
            d="M 1080 540 C 1110 440 1170 352 1260 322 C 1330 300 1400 320 1440 350 L 1440 540 Z"
            fill="url(#ft-deep)"
            opacity="0.8"
          />

          {/* Bumpy foreground clouds */}
          <path
            d="M 0 540 L 0 470 C 30 430 90 420 130 445 C 160 405 230 400 265 440 C 300 420 350 430 370 470 C 390 490 400 520 400 540 Z"
            fill="url(#ft-deep)"
          />
          <path
            d="M 1040 540 C 1050 500 1090 480 1130 492 C 1150 450 1220 440 1255 475 C 1290 445 1360 450 1380 490 C 1410 480 1440 490 1440 500 L 1440 540 Z"
            fill="url(#ft-deep)"
            opacity="0.9"
          />
        </svg>

        {/* Content */}
        <div className="relative flex min-h-[480px] flex-col justify-end px-6 pb-8 pt-40 sm:min-h-[540px] sm:px-12 sm:pb-10 lg:px-20">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1.1fr_1fr_1fr] md:gap-12 lg:gap-20">
            {/* Social blob + brand */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label="Mama Health"
                className="relative flex h-16 w-16 items-center justify-center bg-[#3b3226] p-2.5 text-[#fffaf0] shadow-[0_10px_30px_-10px_rgba(60,45,25,0.45)] transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105 dark:border dark:border-[#e5be79]/30 dark:bg-[#221c15] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
                style={{ borderRadius: "58% 42% 50% 50% / 52% 48% 52% 48%" }}
              >
                <AppLogo className="h-full w-full" size={40} />
                <span className="absolute -right-2.5 -top-2.5 h-3.5 w-3.5 rounded-full bg-[#c9a35d] dark:bg-[#e5be79]" />
              </a>
              <div>
                <p className="text-[28px] font-light tracking-[-0.03em] text-[#4a3f30] dark:text-[#f5ede0]">
                  Mama Health
                </p>
                <p className="text-[14px] text-[#6f6149] dark:text-[#b9a88e]">
                  {t("landing.growWithUsSub")}
                </p>
              </div>
            </div>

            {/* Say hello */}
            <div className="text-center md:text-left">
              <p className="text-[12px] uppercase tracking-[0.28em] text-[#8d6a2a] dark:text-[#dfb870]">
                {t("landing.sayHello")}
              </p>
              <a
                href="mailto:hello@mamahealth.example"
                className="group relative mt-3 inline-block text-[clamp(21px,2.2vw,30px)] font-light tracking-[-0.025em] text-[#4a3f30] transition-colors duration-300 hover:text-[#8d6a2a] dark:text-[#f5ede0] dark:hover:text-[#e5be79]"
              >
                <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                  hello@mamahealth.example
                </span>
              </a>
              <p className="mt-2 text-[16px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {t("landing.sayHelloSub")}
              </p>
            </div>

            {/* Grow with us */}
            <div className="text-center md:text-left">
              <p className="text-[12px] uppercase tracking-[0.28em] text-[#8d6a2a] dark:text-[#dfb870]">
                {t("landing.growWithUs")}
              </p>
              <Link
                href="/login"
                className="group relative mt-3 inline-block text-[clamp(21px,2.2vw,30px)] font-light tracking-[-0.025em] text-[#4a3f30] transition-colors duration-300 hover:text-[#8d6a2a] dark:text-[#f5ede0] dark:hover:text-[#e5be79]"
              >
                <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100">
                  {t("nav.waitlist")}
                </span>
              </Link>
              <p className="mt-2 text-[16px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {t("landing.growWithUsSub")}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#8d6a2a]/20 pt-6 text-[13px] text-[#6f6149] sm:flex-row dark:border-[#e5be79]/18 dark:text-[#9c8b72]">
            <p>{t("landing.copyright")}</p>
            <nav className="flex gap-6">
              <a
                href="#"
                className="group relative transition-colors hover:text-[#4a3f30] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 dark:hover:text-[#f5ede0]"
              >
                {t("landing.privacy")}
              </a>
              <a
                href="#"
                className="group relative transition-colors hover:text-[#4a3f30] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 dark:hover:text-[#f5ede0]"
              >
                {t("landing.terms")}
              </a>
              <a
                href="#journey"
                className="group relative transition-colors hover:text-[#4a3f30] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 dark:hover:text-[#f5ede0]"
              >
                {t("nav.calendar")}
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
