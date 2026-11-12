"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Mic } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { BottomNav } from "../components/BottomNav";
import { HomeTopBar } from "../components/HomeTopBar";
import {
  backendSummaryToArchiveItem,
  createDynamicReportFromCheckins,
  deduplicateReports,
  getLocalizedReport,
  type ReportArchiveItem,
} from "./reportCatalog";
import { ancApi, getAccessToken, reportsApi } from "@/api";
import { useTranslation } from "../components/languageStore";
import { showToast } from "../components/toastStore";

export function ReportsList() {
  const { t, isAmharic } = useTranslation();
  const [reports, setReports] = useState<ReportArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch latest summary from backend
    reportsApi
      .getLatestSummary()
      .then((latest) => {
        if (latest && latest.id) {
          const item = backendSummaryToArchiveItem(latest);
          setReports(deduplicateReports([item]));
        }
      })
      .catch(() => {
        reportsApi
          .generateSummary()
          .then((gen) => {
            if (gen && gen.id) {
              const item = backendSummaryToArchiveItem(gen);
              setReports(deduplicateReports([item]));
            }
          })
          .catch((err) => {
            console.error("Failed to load reports from server:", err);
            showToast(
              isAmharic
                ? "ሪፖርቶችን ከሰርቨር ማምጣት አልተቻለም።"
                : "Failed to load reports from server.",
              "error",
            );
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAmharic]);

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
            {t("reports.title")}
          </h1>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            {t("reports.subtitle")}
          </p>
        </section>

        <section aria-label={t("reports.allReports")} className="mt-6 grid gap-3 md:grid-cols-2">
          {(() => {
            const displayReports = deduplicateReports(reports);
            if (displayReports.length === 0) {
              return (
                <div className="home-glass rounded-[28px] p-8 text-center md:col-span-2" data-dashboard-card>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbe7b8] text-[#8d6a2a] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                    <FileText size={24} strokeWidth={1.8} />
                  </div>
                  <h2 className="mt-4 text-[20px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                    {isAmharic ? "ምንም የተጠናቀቀ የቅድመ ወሊድ ሪፖርት የለም" : "No ANC reports generated yet"}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {isAmharic
                      ? "ዕለታዊ የድምጽ ምዝገባዎችን በማድረግ ለቀጣዩ የቅድመ ወሊድ ቀጠሮዎ የክሊኒክ ሪፖርት ያዘጋጁ።"
                      : "Complete your daily voice check-ins to automatically generate clinical summaries for your ANC visits."}
                  </p>
                  <Link
                    href="/voice"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3b3226] px-6 py-3 text-[14px] font-medium text-[#fbe7b8] transition hover:bg-[#4a3f30] active:scale-95 dark:bg-[#e5be79] dark:text-[#231b12]"
                  >
                    <Mic size={16} />
                    <span>{isAmharic ? "ምዝገባ ጀምር" : "Start a check-in"}</span>
                  </Link>
                </div>
              );
            }

            return displayReports.map((rawReport, index) => {
              const report = getLocalizedReport(rawReport, isAmharic);
              const hasDanger = Boolean(report.dangerSigns?.length);
              const dangerCount = report.dangerSigns?.length ?? 0;

              return (
                <Link
                  key={report.id}
                  href={`/report/${report.id}`}
                  prefetch={true}
                  data-dashboard-card
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
                      {t("reports.checkinsCompleted")}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[26px] font-light tabular-nums text-[#3b3226] dark:text-[#f5ede0]">
                      {report.daysMissed}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-[#6f6149] dark:text-[#c7b69c]">
                      {t("reports.daysMissed")}
                    </span>
                  </span>
                  {hasDanger && (
                    <span>
                      <span className="block text-[26px] font-light tabular-nums text-[#9c3a29] dark:text-[#f08b75]">
                        {dangerCount}
                      </span>
                      <span className="mt-1 block text-[11.5px] text-[#9c3a29] dark:text-[#f08b75]">
                        {t("reports.dangerSigns")}
                      </span>
                    </span>
                  )}
                </span>

                <span className="relative mt-4 block text-[13px] leading-relaxed text-[#6f6149] dark:text-[#c7b69c]">
                  {report.summary}
                </span>
              </Link>
            );
          });
        })()}
        </section>
      </main>

      <BottomNav current="report" />
    </div>
  );
}
