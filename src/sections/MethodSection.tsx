import { CareIllustration, type CareArt } from "./method/CareIllustration";
import { Reveal } from "./method/Reveal";

const steps = [
  {
    title: "A gentle morning check-in",
    body: "Mood, sleep, blood pressure and symptoms, gathered in about a minute and shaped into a clear picture your midwife can read at a glance.",
    meta: "About a minute · every morning",
    orbSide: "right" as const,
    art: "morning" as CareArt,
  },
  {
    title: "Kick counts & contraction timing",
    body: "Simple, rhythmic logging that learns your baby's usual patterns, and quietly lets you know when a call to your midwife is worth making.",
    meta: "One tap · learns your rhythm",
    orbSide: "left" as const,
    art: "kicks" as CareArt,
  },
  {
    title: "A midwife, whenever you need one",
    body: "Real registered midwives, not scripts. Every conversation is kept in your shared care record, so you never have to explain yourself twice.",
    meta: "Replies in minutes · day or night",
    orbSide: "right" as const,
    art: "midwife" as CareArt,
  },
];

export function MethodSection({ onLearnMore }: { onLearnMore?: () => void }) {
  return (
    <section
      id="care"
      className="relative scroll-mt-6 overflow-hidden bg-[linear-gradient(180deg,#f3ecdf_0%,#f8f2e8_45%,#f2e8d5_100%)] text-[#4a3f30] dark:bg-[linear-gradient(180deg,#15120e_0%,#1a1510_45%,#14100c_100%)] dark:text-[#f0e4ce]"
    >
      {/* Soft ambient light, same family as the hero */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-[8%] h-[520px] w-[520px] rounded-full bg-[#f3d9a4] opacity-40 blur-[140px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-40 top-[42%] h-[560px] w-[560px] rounded-full bg-[#f7e2bd] opacity-50 blur-[150px] dark:bg-[#8d6224] dark:opacity-14" />
        <div className="absolute -left-32 bottom-[4%] h-[460px] w-[460px] rounded-full bg-[#fff6e3] opacity-80 blur-[130px] dark:bg-[#6e4c1b] dark:opacity-15" />
      </div>

      {/* Intro */}
      <div className="relative mx-auto max-w-[760px] px-6 pt-28 text-center sm:px-10 lg:pt-40">
        <Reveal>
          <h2 className="text-[clamp(34px,5vw,64px)] font-light leading-[1.05] tracking-[-0.03em] text-[#4a3f30] dark:text-[#f5ede0]">
            Care that moves{" "}
            <span className="text-[#b98a3e] dark:text-[#e5be79]">with you,</span> week by week.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-[16px] leading-[1.75] text-[#6f6149] dark:text-[#b9a88e]">
            Gentle tools that fit into your day. No dashboards to decode, no alarms to dread.
          </p>
        </Reveal>
      </div>

      {/* Alternating rows */}
      <div
        id="journey"
        className="relative mx-auto max-w-[1280px] scroll-mt-6 px-6 pb-28 pt-10 sm:px-10 lg:px-16 lg:pb-40"
      >
        {steps.map((s) => {
          const orbOnRight = s.orbSide === "right";
          return (
            <div
              key={s.title}
              className="grid grid-cols-1 items-center gap-6 py-14 lg:grid-cols-2 lg:gap-24 lg:py-24"
            >
              {/* TEXT */}
              <Reveal className={`${orbOnRight ? "lg:order-1" : "lg:order-2"} max-w-[480px]`}>
                <h3 className="text-[clamp(26px,3vw,42px)] font-normal leading-[1.12] tracking-[-0.025em] text-[#4a3f30] dark:text-[#f5ede0]">
                  {s.title}
                </h3>
                <p className="mt-5 text-[16px] leading-[1.8] text-[#6f6149] dark:text-[#c7b69c]">
                  {s.body}
                </p>
                <p className="mt-6 flex items-center gap-2.5 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#dcb86f] dark:bg-[#e5be79]" />
                  {s.meta}
                </p>
                <button
                  type="button"
                  onClick={onLearnMore}
                  className="group mt-7 inline-flex items-center gap-2 rounded-full text-[14px] text-[#8d6a2a] outline-none transition-colors duration-500 hover:text-[#4a3f30] focus-visible:ring-2 focus-visible:ring-[#caa152] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5eee0] dark:text-[#e5be79] dark:hover:text-[#f5ede0] dark:focus-visible:ring-offset-[#15120e]"
                >
                  Learn more
                  <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </Reveal>

              {/* ILLUSTRATION */}
              <Reveal
                delay={150}
                className={`${orbOnRight ? "lg:order-2" : "lg:order-1"} relative mx-auto h-[300px] w-full max-w-[420px] sm:h-[380px] lg:h-[440px]`}
              >
                <div className="silk-sway h-full w-full motion-reduce:animate-none">
                  <CareIllustration art={s.art} />
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
