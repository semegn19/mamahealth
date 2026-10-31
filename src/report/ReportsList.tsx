"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { BottomNav, HomeTopBar } from "../home/HomeDashboard";
import { REPORT_ARCHIVE } from "./reportCatalog";

export function ReportsList() {
  const router = useRouter();

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-28 blur-[105px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[960px] md:px-8">
        <HomeTopBar />

        <section className="mt-8">
          <h1 className="text-[34px] font-light leading-none tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]">
            ANC reports
          </h1>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            Monthly check-in summaries prepared for each antenatal appointment.
          </p>
        </section>

        <section aria-label="All ANC reports" className="mt-6 grid gap-3 md:grid-cols-2">
          {REPORT_ARCHIVE.map((report, index) => {
            const hasDanger = Boolean(report.dangerSigns?.length);
            const dangerCount = report.dangerSigns?.length ?? 0;

            return (
              <button
                key={report.id}
                type="button"
                data-dashboard-card
                onClick={() => {
                  router.push(`/report/${report.id}`);
                }}
                className={`report-list-card group relative overflow-hidden rounded-[26px] border p-5 text-left shadow-[0_14px_34px_-23px_rgba(112,78,28,0.48)] backdrop-blur-xl transition hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none dark:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.82)] ${
                  hasDanger
                    ? "border-[#c65a45]/60 bg-[linear-gradient(145deg,rgba(247,224,216,0.92),rgba(198,90,69,0.3))] hover:border-[#c65a45]/90 focus-visible:outline-[#9c3a29] dark:border-[#d9715b]/50 dark:bg-[linear-gradient(145deg,rgba(84,31,23,0.82),rgba(50,19,14,0.86))] dark:hover:border-[#e8846e] dark:focus-visible:outline-[#f08b75] md:col-span-2"
                    : index === 0
                      ? "border-white/80 bg-[linear-gradient(145deg,rgba(251,231,184,0.78),rgba(229,190,125,0.48))] hover:border-[#c9a35d]/65 focus-visible:outline-[#8d6a2a] dark:border-[#e5be79]/34 dark:bg-[linear-gradient(145deg,rgba(88,63,27,0.64),rgba(50,36,17,0.78))] dark:hover:border-[#e5be79]/65 dark:focus-visible:outline-[#e5be79] md:col-span-2"
                      : "border-white/75 bg-white/70 hover:border-[#c9a35d]/65 focus-visible:outline-[#8d6a2a] dark:border-[#e5be79]/16 dark:bg-[#231c15]/82 dark:hover:border-[#e5be79]/45 dark:focus-visible:outline-[#e5be79]"
                }`}
                style={{ "--report-item-delay": `${90 + index * 80}ms` } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${
                    hasDanger ? "bg-[#e08a72]/50 dark:bg-[#c65a45]/22" : "bg-white/40 dark:bg-[#e5be79]/10"
                  }`}
                />
                <span className="relative flex items-start justify-between gap-5">
                  <span className="min-w-0">
                    <span className="block text-[22px] font-medium tracking-[-0.025em] text-[#3b3226] dark:text-[#f5ede0]">
                      {report.appointment}
                    </span>
                    <span className="mt-1 block text-[13px] text-[#85735a] dark:text-[#a8967b]">
                      {report.range}
                    </span>
                  </span>
                  <span
                    className={`home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                      hasDanger
                        ? "text-[#9c3a29] dark:text-[#f08b75]"
                        : "text-[#4a3f30] dark:text-[#f0e4ce]"
                    }`}
                  >
                    <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>

                <span
                  className={`relative mt-5 grid gap-3 border-t pt-4 ${
                    hasDanger
                      ? "grid-cols-3 border-[#9c3a29]/20 dark:border-[#d9715b]/25"
                      : "grid-cols-2 border-[#b98a3e]/18 dark:border-[#e5be79]/16"
                  }`}
                >
                  <span>
                    <span className="block text-[26px] font-light tabular-nums text-[#3b3226] dark:text-[#f5ede0]">
                      {report.checkinRate}%
                    </span>
                    <span className="mt-1 block text-[11.5px] text-[#6f6149] dark:text-[#c7b69c]">
                      check-ins completed
                    </span>
                  </span>
                  <span>
                    <span className="block text-[26px] font-light tabular-nums text-[#3b3226] dark:text-[#f5ede0]">
                      {report.daysMissed}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-[#6f6149] dark:text-[#c7b69c]">
                      days missed
                    </span>
                  </span>
                  {hasDanger && (
                    <span>
                      <span className="block text-[26px] font-light tabular-nums text-[#9c3a29] dark:text-[#f08b75]">
                        {dangerCount}
                      </span>
                      <span className="mt-1 block text-[11.5px] text-[#9c3a29] dark:text-[#f08b75]">
                        danger signs
                      </span>
                    </span>
                  )}
                </span>

                <span className="relative mt-4 block text-[13px] leading-relaxed text-[#6f6149] dark:text-[#c7b69c]">
                  {report.summary}
                </span>
              </button>
            );
          })}
        </section>
      </main>

      <BottomNav current="report" />
    </div>
  );
}
