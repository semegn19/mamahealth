"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NextDotFillButton } from "../components/NextDotFillButton";
import { ModalDialog } from "../components/ModalDialog";
import { Footer } from "../sections/Footer";
import { HeroArt } from "../sections/HeroArt";
import { MethodSection } from "../sections/MethodSection";

const navItems = ["Welcome", "Care", "Journey", "Contact"] as const;

/** Where each landing nav item should take you. */
const NAV_TARGETS: Record<(typeof navItems)[number], string> = {
  Welcome: "welcome",
  Care: "care",
  Journey: "journey",
  Contact: "contact",
};

export function LandingPage() {
  const [active, setActive] = useState("Welcome");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/login");
    router.prefetch("/home");
  }, [router]);

  /** Nav items scroll to their section instead of touching the hash router. */
  const goTo = (item: (typeof navItems)[number]) => {
    setActive(item);
    setMenuOpen(false);
    document.getElementById(NAV_TARGETS[item])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen w-full bg-[#e9e3d8] dark:bg-[#15120e]">
      <section
        id="welcome"
        className="relative flex min-h-screen w-full scroll-mt-0 flex-col overflow-hidden bg-[#ece7de] lg:flex-row dark:bg-[#17130f]"
      >
        {/* Ambient golden blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-a absolute -left-24 top-[30%] h-[520px] w-[520px] rounded-full bg-[#f3d9a4] opacity-70 blur-[120px] dark:bg-[#c99642] dark:opacity-15" />
          <div className="blob-b absolute left-[25%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#fff6e3] opacity-90 blur-[100px] dark:bg-[#8d6224] dark:opacity-14" />
          <div className="blob-a absolute bottom-[-120px] left-[45%] h-[380px] w-[380px] rounded-full bg-[#e8c27d] opacity-50 blur-[120px] dark:bg-[#6e4c1b] dark:opacity-18" />
          <div className="absolute -left-10 -top-10 h-[300px] w-[300px] rounded-full bg-white opacity-80 blur-[90px] dark:bg-[#e5be79] dark:opacity-10" />
        </div>

        {/* The line drawing sits directly on the hero, behind the copy */}
        <HeroArt />

        {/* Feathered wash behind the copy: fades to nothing, so there is no seam
            between the left column and the artwork on the right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.12)_42%,rgba(255,255,255,0)_72%)] dark:bg-[linear-gradient(to_right,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.14)_42%,rgba(0,0,0,0)_74%)]"
        />

        {/* LEFT — copy column */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14">
          {/* Header */}
          <header className="flex items-start justify-between gap-6 lg:max-w-[64%] xl:max-w-[60%] 2xl:max-w-[56%]">
            <nav className="hidden sm:block">
              <ul className="space-y-0.5 text-[15px] leading-snug">
                {navItems.map((item) => (
                  <li key={item}>
                    <button
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

          {/* Headline */}
          <div className="my-14 lg:my-0 lg:max-w-[58%] xl:max-w-[56%] 2xl:max-w-[54%]">
            <h1 className="text-[18vw] font-medium leading-[0.82] tracking-[-0.04em] sm:text-[13vw] lg:text-[8.2vw] 2xl:text-[132px]">
              <span
                className="rise block text-[#4a3f30] dark:text-[#f5ede0]"
                style={{ animationDelay: "0.1s" }}
              >
                We’re
              </span>
              <span
                className="rise block text-[#c9b489] dark:text-[#c9a35d]"
                style={{ animationDelay: "0.25s" }}
              >
                growing
              </span>
              <span className="rise relative inline-block" style={{ animationDelay: "0.4s" }}>
                <span className="gold-shimmer drop-shadow-[0_2px_20px_rgba(201,160,90,0.35)]">
                  together
                </span>
                <span className="absolute -bottom-2 left-0 h-[5px] w-[62%] rounded-full bg-white/95 dark:bg-[#e5be79]/90" />
              </span>
            </h1>
          </div>

          {/* Footer row */}
          <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between lg:max-w-[58%] xl:max-w-[56%] 2xl:max-w-[54%]">
            {/* "Begin your journey" button */}
            <div className="flex items-center">
              <NextDotFillButton
                label="Begin your journey"
                onMouseEnter={() => router.prefetch("/login")}
                onClick={() => {
                  router.push("/login");
                }}
              />
            </div>

            <p className="max-w-[440px] text-[13.5px] leading-relaxed text-[#ad9f86] sm:text-right dark:text-[#9c8b72]">
              Mama Health is a{" "}
              <a
                href="#"
                className="text-[#4a3f30] underline decoration-[#c9a35d] underline-offset-2 dark:text-[#f5ede0] dark:decoration-[#e5be79]"
              >
                gentle maternal health companion
              </a>{" "}
              guiding you through pregnancy, birth and early motherhood with{" "}
              <span className="text-[#4a3f30] dark:text-[#f5ede0]">care that grows with you.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 02 — The Mama Health Method (orbs on the left, words on the right) */}
      <MethodSection onLearnMore={() => setShowJourneyModal(true)} />

      {/* FOOTER */}
      <Footer />

      {/* Gentle Journey Modal (triggered on click) */}
      <ModalDialog
        open={showJourneyModal}
        onClose={() => setShowJourneyModal(false)}
        ariaLabelledBy="landing-journey-title"
        containerClassName="max-w-lg"
      >
        <div
          className="relative w-full rounded-3xl border border-white/80 bg-[#f8f5ee]/95 p-7 shadow-[0_20px_60px_rgba(140,105,45,0.3)] backdrop-blur-2xl sm:p-9 dark:border-[#e5be79]/22 dark:bg-[#221c15]/96 dark:shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
        >
          <button
            onClick={() => setShowJourneyModal(false)}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#4a3f30] transition hover:bg-black/10 dark:bg-white/10 dark:text-[#f0e4ce] dark:hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>

          <span className="inline-block rounded-full bg-[#faedd2] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[#966b24] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
            Mama Health Maternal Care
          </span>

          <h3
            id="landing-journey-title"
            className="mt-3 text-2xl font-medium tracking-tight text-[#3b3226] sm:text-3xl dark:text-[#f5ede0]"
          >
            Your journey begins with soft, continuous care.
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-[#7e715d] dark:text-[#b9a88e]">
            From fertility & early first-trimester reassurance to birth preparation and the tender
            fourth trimester, Mama Health connects you with holistic midwife advice, daily milestone
            affirmations, and body awareness tools.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[
              { phase: "Trimester 1", detail: "Nourish & adapt" },
              { phase: "Trimester 2", detail: "Movement & joy" },
              { phase: "Trimester 3", detail: "Birth & calm" },
            ].map((t) => (
              <div
                key={t.phase}
                className="rounded-2xl border border-[#ebd8b7] bg-white/70 p-3 text-left dark:border-[#3d3123] dark:bg-[#19140f]/85"
              >
                <p className="text-xs font-semibold text-[#8b6528] dark:text-[#e5be79]">
                  {t.phase}
                </p>
                <p className="mt-0.5 text-[11px] text-[#716453] dark:text-[#b9a88e]">
                  {t.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-[#ddcaa7] bg-white px-4 py-2.5 text-sm text-[#4a3f30] placeholder-[#b2a28d] outline-none focus:border-[#a88241] dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder-[#7d6e58] dark:focus:border-[#e5be79]"
            />
            <button
              type="button"
              onClick={() => setShowJourneyModal(false)}
              className="rounded-full bg-[#4a3f30] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#342b20] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              Get early access
            </button>
          </div>
        </div>
      </ModalDialog>
    </main>
  );
}
