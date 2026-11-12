import type { Metadata } from "next";
import { HeroArt } from "@/sections/HeroArt";
import { MethodSection } from "@/sections/MethodSection";
import { Footer } from "@/sections/Footer";
import { LandingHeader } from "@/landing/LandingHeader";
import { LandingHeroCTA } from "@/landing/LandingHeroCTA";
import { LandingHeroHeadline } from "@/landing/LandingHeroHeadline";

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

          {/* Headline */}
          <div className="my-14 lg:my-0 lg:max-w-[58%] xl:max-w-[56%] 2xl:max-w-[54%]">
            <LandingHeroHeadline />
          </div>

          {/* Footer row with CTA */}
          <LandingHeroCTA />
        </div>
      </section>

      {/* SECTION 02 — The Mama Health Method (Server Component) */}
      <MethodSection />

      {/* FOOTER (Server Component) */}
      <Footer />
    </main>
  );
}
