import type { Metadata } from "next";
import { HeroArt } from "@/sections/HeroArt";
import { MethodSection } from "@/sections/MethodSection";
import { Footer } from "@/sections/Footer";
import { LandingHeader } from "@/landing/LandingHeader";
import { LandingHeroCTA } from "@/landing/LandingHeroCTA";
import { JourneyModal } from "@/landing/JourneyModal";

export const metadata: Metadata = {
  title: "Mama Health — Gentle care for every stage of motherhood",
  description:
    "A gentle maternal health companion guiding you through pregnancy, birth and early motherhood with care that grows with you.",
};

export default function Page() {
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

        {/* The line drawing sits directly on the hero, behind the copy (Server Component) */}
        <HeroArt />

        {/* Feathered wash behind the copy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.12)_42%,rgba(255,255,255,0)_72%)] dark:bg-[linear-gradient(to_right,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.14)_42%,rgba(0,0,0,0)_74%)]"
        />

        {/* LEFT — copy column */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14">
          {/* Header navigation (Client Component island) */}
          <LandingHeader />

          {/* Headline (Server Component markup) */}
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

          {/* Footer row with CTA */}
          <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between lg:max-w-[58%] xl:max-w-[56%] 2xl:max-w-[54%]">
            <LandingHeroCTA />

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

      {/* SECTION 02 — The Mama Health Method (Server Component) */}
      <MethodSection />

      {/* FOOTER (Server Component) */}
      <Footer />

      {/* Gentle Journey Modal (Client Component island) */}
      <JourneyModal />
    </main>
  );
}
