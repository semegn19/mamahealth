"use client";

import { useState, type CSSProperties } from "react";
import { AlertTriangle, ChevronRight, Mic } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { HomeTopBar } from "@/components/HomeTopBar";
import { CheckinReportSheet } from "../components/CheckinReportSheet";
import { CHECKIN_LOGS } from "./checkinLogsData";
import { useTranslation } from "@/components/languageStore";

function formatDate(date: Date, isAmharic: boolean) {
  return date.toLocaleDateString(isAmharic ? "am-ET" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date, isAmharic: boolean) {
  return date.toLocaleTimeString(isAmharic ? "am-ET" : "en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function CheckinLogs() {
  const { t, isAmharic } = useTranslation();
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const openLog = CHECKIN_LOGS.find((log) => log.id === openLogId) ?? null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-28 blur-[105px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[720px] md:px-8">
        <HomeTopBar />

        <section className="mt-8">
          <h1 className="text-[34px] font-light leading-none tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]">
            {t("logs.title")}
          </h1>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            {t("logs.subtitle")}
          </p>
        </section>

        <section aria-label={t("logs.title")} className="mt-6 space-y-3.5">
          {CHECKIN_LOGS.map((log, index) => {
            const dangerSigns = log.dangerSigns ?? [];
            const hasDanger = dangerSigns.length > 0;
            const sessionLabel =
              log.session === "Morning" ? t("logs.morningSession") : t("logs.eveningSession");

            return (
              <button
                key={log.id}
                type="button"
                data-dashboard-card
                onClick={() => setOpenLogId(log.id)}
                aria-label={`${formatDate(log.date, isAmharic)}, ${formatTime(log.date, isAmharic)}`}
                className={`report-list-card home-glass group flex w-full items-center gap-3.5 rounded-[26px] p-5 text-left transition hover:-translate-y-0.5 active:scale-[0.99] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-6 ${
                  hasDanger
                    ? "!border-[#c65a45]/35 hover:!border-[#c65a45]/60 focus-visible:outline-[#9c3a29] dark:!border-[#d9715b]/38 dark:hover:!border-[#e8846e]/65 dark:focus-visible:outline-[#f08b75]"
                    : "hover:!border-[#c9a35d]/55 focus-visible:outline-[#8d6a2a] dark:hover:!border-[#e5be79]/40 dark:focus-visible:outline-[#e5be79]"
                }`}
                style={{ "--report-item-delay": `${70 + index * 55}ms` } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 aspect-square items-center justify-center rounded-full ${
                    hasDanger
                      ? "bg-[#9c3a29]/12 text-[#9c3a29] dark:bg-[#c65a45]/20 dark:text-[#f08b75]"
                      : "bg-[#d9ab5e]/15 text-[#7b5b2b] dark:bg-[#e5be79]/15 dark:text-[#e5be79]"
                  }`}
                >
                  {hasDanger ? (
                    <AlertTriangle size={18} strokeWidth={1.85} />
                  ) : (
                    <Mic size={18} strokeWidth={1.8} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {formatDate(log.date, isAmharic)}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {formatTime(log.date, isAmharic)} · {sessionLabel} ·{" "}
                    {t("logs.questionCount", { count: log.entries.length })}
                  </span>
                </span>

                <ChevronRight
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={`shrink-0 transition-all duration-200 group-hover:translate-x-0.5 ${
                    hasDanger
                      ? "text-[#a76a56] group-hover:text-[#9c3a29] dark:text-[#c98b7c] dark:group-hover:text-[#f08b75]"
                      : "text-[#85735a] group-hover:text-[#6f5a35] dark:text-[#9c8b72] dark:group-hover:text-[#e5be79]"
                  }`}
                />
              </button>
            );
          })}
        </section>
      </main>

      <BottomNav current="checkin" />

      <CheckinReportSheet
        open={openLog !== null}
        onClose={() => setOpenLogId(null)}
        eyebrow={
          openLog
            ? `${formatDate(openLog.date, isAmharic)} · ${formatTime(openLog.date, isAmharic)}`
            : ""
        }
        title={t("logs.detailTitle")}
        entries={openLog?.entries ?? []}
        dangerSigns={openLog?.dangerSigns}
        emptyMessage={t("logs.emptyDetail")}
      />
    </div>
  );
}
