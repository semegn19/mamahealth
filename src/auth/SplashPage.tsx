"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { LeafMark } from "../components/LeafMark";

const MESSAGES = [
  "Preparing your space…",
  "Gathering today's check-in…",
  "Wrapping everything in calm…",
];

const DURATION_MS = 3200;

/**
 * Single-state loading screen shown right after sign-in.
 * Logo at the center, app name beneath it, and gentle motion
 * (breathing logo, progress bar, rotating messages) while the app opens.
 */
export function SplashPage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // `replace` keeps the splash out of history so Back never loops through it.
    const advance = window.setTimeout(() => router.replace("/home"), DURATION_MS);
    const rotate = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGES.length);
    }, 1100);
    return () => {
      window.clearTimeout(advance);
      window.clearInterval(rotate);
    };
  }, [router]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      {/* Soft ambient glow, consistent with the app */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-95 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[28%] h-[340px] w-[340px] rounded-full bg-[#f3d9a4] opacity-45 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-20 bottom-[-10%] h-[320px] w-[320px] rounded-full bg-[#f7dfb3] opacity-55 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
        <div className="absolute right-[12%] bottom-[6%] h-[200px] w-[200px] rounded-full bg-white opacity-70 blur-[80px] dark:bg-[#e5be79] dark:opacity-10" />
      </div>

      <div
        role="status"
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-1 flex-col items-center justify-center px-6 text-center"
      >
        {/* Logo with slow breathing pulse + expanding rings */}
        <div className="relative flex h-40 w-40 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#c9a35d]/40 [animation-duration:2.4s] dark:border-[#e5be79]/35" />
          <span
            className="absolute inset-0 animate-ping rounded-full border border-[#c9a35d]/30 [animation-duration:2.4s] dark:border-[#e5be79]/25"
            style={{ animationDelay: "1.2s" }}
          />
          <span className="splash-breathe flex h-24 w-24 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] shadow-[0_18px_40px_-16px_rgba(60,45,25,0.65)] dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_18px_44px_-14px_rgba(229,190,121,0.45)]">
            <LeafMark className="h-[64px] w-[64px]" />
          </span>
        </div>

        {/* App name */}
        <p className="mt-7 text-[38px] font-medium leading-none tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
          Mama Health
        </p>
        <p className="mt-2.5 text-[13.5px] text-[#6f6149] dark:text-[#b9a88e]">
          Gentle care for every stage of motherhood
        </p>

        {/* Progress bar */}
        <div
          aria-hidden="true"
          className="mt-9 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#e2d3b4] dark:bg-[#33291e]"
        >
          <div className="splash-progress h-full w-full rounded-full bg-gradient-to-r from-[#d9ab5e] to-[#a87a3d] dark:from-[#f0cf92] dark:to-[#c99642]" />
        </div>

        {/* Rotating message (visual only; screen readers get a static label) */}
        <p aria-hidden="true" className="mt-4 h-5 text-[13.5px] text-[#85735a] dark:text-[#9c8b72]">
          <span key={messageIndex} className="splash-msg inline-block">
            {MESSAGES[messageIndex]}
          </span>
        </p>
        <p className="sr-only">Loading Mama Health, please wait.</p>

        <button
          type="button"
          onClick={() => router.replace("/home")}
          className="group mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-[#8d6a2a] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#4a3f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#e5be79] dark:hover:text-[#f5ede0] dark:focus-visible:outline-[#e5be79]"
        >
          Continue
          <ArrowRight
            size={15}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
