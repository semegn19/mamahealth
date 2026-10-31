"use client";

import { useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AlertTriangle, ChevronLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { SeverityCalendar, SymptomBars } from "./charts";
import { FoodScoreDonut } from "./FoodScoreDonut";
import { ReportShareButton } from "./ReportShareButton";
import { SupplementAdherence } from "./SupplementAdherence";
import { useCountUp } from "./useInViewOnce";
import { getReportArchiveItem } from "./reportCatalog";
import {
  AVG_FOOD_GROUPS,
  DAYS_WITH_SYMPTOMS,
  FOOD_COVERAGE_DAYS,
  FOOD_GROUPS,
  MONTH,
  RECORDED_DAYS,
  SEVERITY_LEVELS,
  SUPPLEMENT_REPORTS,
  SYMPTOM_TOTALS,
  TOTAL_DAYS,
  type DayRecord,
} from "./reportData";

const topSymptoms = SYMPTOM_TOTALS.slice(0, 4);
const leading = topSymptoms[0];

export function AncReport({ reportId }: { reportId?: string }) {
  const router = useRouter();
  const report = getReportArchiveItem(reportId);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);
  const symptomDetailsId = useId();

  const dangerSigns = report.dangerSigns ?? [];
  const dangerSignsByDay = useMemo(() => {
    const byDay = new Map<number, number>();
    dangerSigns.forEach((sign) => byDay.set(sign.day, (byDay.get(sign.day) ?? 0) + 1));
    return byDay;
  }, [dangerSigns]);
  const dangerDays = useMemo(() => new Set(dangerSignsByDay.keys()), [dangerSignsByDay]);
  const selectedDangerSigns = selectedDay
    ? dangerSigns.filter((sign) => sign.day === selectedDay.day)
    : [];

  const animatedCheckinRate = Math.round(useCountUp(report.checkinRate, { duration: 1150 }));
  const animatedMissedDays = Math.round(
    useCountUp(report.daysMissed, { duration: 950, delay: 140 }),
  );
  const animatedDangerSigns = Math.round(
    useCountUp(dangerSigns.length, { duration: 950, delay: 260 }),
  );

  const goReports = () => {
    router.push("/reports");
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#f5efe3] text-[#3b3226] dark:bg-[#15120e] dark:text-[#f5ede0]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[6%] h-[320px] w-[320px] rounded-full bg-[#f7dfb3] opacity-60 blur-[100px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[40%] h-[320px] w-[320px] rounded-full bg-[#e9bd78] opacity-25 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute bottom-[-80px] left-[18%] h-[280px] w-[280px] rounded-full bg-white opacity-75 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <div className="relative mx-auto w-full max-w-[440px] px-5 pb-36 pt-6">
        {/* Header */}
        <header>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goReports}
              aria-label="Back to reports"
              className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              <ReportShareButton appointment={report.appointment} reportId={report.id} />
            </div>
          </div>
          <div className="mt-5">
            <h1 className="text-[30px] font-light leading-none tracking-[-0.03em] text-[#3b3226] dark:text-[#f5ede0]">
              ANC report
            </h1>
            <p className="mt-2 text-[14.5px] text-[#6f6149] dark:text-[#c7b69c]">
              For your {report.appointment}
            </p>
            <p className="mt-0.5 text-[13px] text-[#9b8a6f] dark:text-[#9c8b72]">{report.range}</p>
          </div>
        </header>

        {dangerSigns.length > 0 && (
          <div
            role="alert"
            className="report-reveal relative mt-4 flex items-start gap-3 overflow-hidden rounded-[20px] border border-[#c65a45]/45 bg-[#f6e0d8]/90 px-4 py-3.5 shadow-[0_10px_28px_-18px_rgba(156,58,41,0.55)] backdrop-blur-xl dark:border-[#d9715b]/45 dark:bg-[#3f1913]/88 dark:shadow-[0_14px_32px_-16px_rgba(0,0,0,0.8)]"
            style={{ "--reveal-delay": "40ms" } as CSSProperties}
          >
            <AlertTriangle
              size={20}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-[#9c3a29] dark:text-[#f08b75]"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-tight text-[#7d2b1c] dark:text-[#fde8e1]">
                {dangerSigns.length} danger sign{dangerSigns.length > 1 ? "s" : ""} recorded this
                period
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#8a3b2c] dark:text-[#eab0a2]">
                These need clinical review before your next visit. If any continue or get worse,
                contact your care team right away.
              </p>
            </div>
          </div>
        )}

        {/* Summary card */}
        <section
          aria-label="Check-in summary"
          className={`report-reveal relative mt-7 overflow-hidden rounded-[28px] p-5 ${
            dangerSigns.length ? "report-danger-card" : "home-glass-gold"
          }`}
          style={{ "--reveal-delay": "60ms" } as CSSProperties}
        >
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />
          <div className="relative">
            <span
              className={`inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] ${
                dangerSigns.length
                  ? "text-[#8a3b2c] dark:text-[#f08b75]"
                  : "text-[#6f5a35] dark:text-[#e5be79]"
              }`}
            >
              <FileText size={13} strokeWidth={1.9} />
              Check-in summary
            </span>
            <div
              className={`mt-3 grid gap-4 ${
                dangerSigns.length ? "grid-cols-[1.15fr_0.85fr_0.85fr]" : "grid-cols-[1.3fr_1fr]"
              }`}
            >
              <div>
                <p className="text-[44px] font-light tabular-nums leading-none tracking-[-0.03em] text-[#3b3226] dark:text-[#f5ede0]">
                  <span className="sr-only">{report.checkinRate}%</span>
                  <span aria-hidden="true">{animatedCheckinRate}%</span>
                </p>
                <p
                  className={`mt-1.5 text-[13.5px] ${
                    dangerSigns.length
                      ? "text-[#8a3b2c] dark:text-[#eab0a2]"
                      : "text-[#6f5a35] dark:text-[#d8c7ab]"
                  }`}
                >
                  daily check-ins completed
                </p>
              </div>
              <div>
                <p className="text-[44px] font-light tabular-nums leading-none tracking-[-0.03em] text-[#3b3226] dark:text-[#f5ede0]">
                  <span className="sr-only">{report.daysMissed}</span>
                  <span aria-hidden="true">{animatedMissedDays}</span>
                </p>
                <p
                  className={`mt-1.5 text-[13.5px] ${
                    dangerSigns.length
                      ? "text-[#8a3b2c] dark:text-[#eab0a2]"
                      : "text-[#6f5a35] dark:text-[#d8c7ab]"
                  }`}
                >
                  {report.daysMissed === 1 ? "day missed" : "days missed"}
                </p>
              </div>
              {dangerSigns.length > 0 && (
                <div>
                  <p
                    className="text-[44px] font-light tabular-nums leading-none tracking-[-0.03em] text-[#9c3a29] dark:text-[#f08b75]"
                    role="status"
                  >
                    <span className="sr-only">{dangerSigns.length}</span>
                    <span aria-hidden="true">{animatedDangerSigns}</span>
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-medium text-[#9c3a29] dark:text-[#f08b75]">
                    {dangerSigns.length === 1 ? "danger sign" : "danger signs"}
                  </p>
                </div>
              )}
            </div>
            <p
              className={`mt-3 text-[13px] leading-relaxed ${
                dangerSigns.length
                  ? "text-[#8a3b2c] dark:text-[#eab0a2]"
                  : "text-[#6f5a35] dark:text-[#d8c7ab]"
              }`}
            >
              {TOTAL_DAYS - report.daysMissed} of {TOTAL_DAYS} days logged · {report.clinician}
            </p>
          </div>
        </section>

        {/* Symptoms */}
        <Section
          title="Symptoms"
          note={`Logged on ${DAYS_WITH_SYMPTOMS} of ${RECORDED_DAYS} recorded days`}
          revealDelay={150}
        >
          <SeverityCalendar
            selectedDay={selectedDay?.day ?? null}
            onSelectDay={setSelectedDay}
            detailsId={symptomDetailsId}
            dangerCountsByDay={dangerSignsByDay}
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[11.5px] text-[#6f6149] dark:text-[#b9a88e]">
            {dangerSigns.length > 0 && (
              <span className="flex items-center gap-1.5 font-medium text-[#9c3a29] dark:text-[#f08b75]">
                <span aria-hidden="true" className="h-3 w-3 rounded-[4px] bg-[#c65a45]" />
                Danger sign
              </span>
            )}
            {Object.values(SEVERITY_LEVELS).map((level) => (
              <span key={level.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-[4px]"
                  style={{ backgroundColor: level.color }}
                />
                {level.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-[4px] border border-[#e2d3b4] bg-[#faf5eb] dark:border-[#3d3123] dark:bg-[#19140f]"
              />{" "}
              No symptoms
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-[4px] border border-dashed border-[#b5a07c] dark:border-[#66543f]"
              />{" "}
              No check-in
            </span>
          </div>

          <div
            id={symptomDetailsId}
            role="region"
            aria-label="Selected day's symptoms"
            aria-live="polite"
            aria-atomic="true"
            className="mt-5"
          >
            {selectedDay ? (
              <div key={selectedDay.day} className="motion-safe:animate-[rise_0.25s_ease-out_both]">
                <h3 className="text-[15px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                  {selectedDay.date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                {selectedDangerSigns.length > 0 && (
                  <div
                    role="region"
                    aria-label="Danger signs this day"
                    className="mt-3 rounded-[16px] border border-[#c65a45]/35 bg-[#f6e0d8]/65 p-3.5 dark:border-[#d9715b]/45 dark:bg-[#3f1913]/75"
                  >
                    <h4 className="flex items-center gap-2 text-[13px] font-semibold text-[#7d2b1c] dark:text-[#fde8e1]">
                      <AlertTriangle size={15} strokeWidth={2.2} aria-hidden="true" />
                      Danger signs this day
                    </h4>
                    <ul className="mt-2.5 space-y-2.5">
                      {selectedDangerSigns.map((sign) => (
                        <li key={`${sign.name}-${sign.day}`}>
                          <p className="text-[13.5px] font-medium text-[#4a2318] dark:text-[#fde8e1]">
                            {sign.name}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-relaxed text-[#8a3b2c] dark:text-[#eab0a2]">
                            {sign.detail}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!selectedDay.recorded ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    No check-in recorded for this day.
                  </p>
                ) : selectedDay.symptoms.length === 0 ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {selectedDangerSigns.length > 0
                      ? "No other symptoms recorded in this day's check-in."
                      : "No symptoms recorded in this day's check-in."}
                  </p>
                ) : (
                  <div className={selectedDangerSigns.length > 0 ? "mt-4" : "mt-3"}>
                    {selectedDangerSigns.length > 0 && (
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d6a2a] dark:text-[#dfb870]">
                        Other symptoms
                      </h4>
                    )}
                    <dl className={`space-y-2.5 ${selectedDangerSigns.length > 0 ? "mt-2.5" : ""}`}>
                      {selectedDay.symptoms.map((symptom) => {
                        const level = SEVERITY_LEVELS[symptom.severity];
                        return (
                          <div key={symptom.name} className="flex items-center justify-between gap-4">
                            <dt className="text-[14px] text-[#4a3f30] dark:text-[#f0e4ce]">
                              {symptom.name}
                            </dt>
                            <dd className="flex items-center gap-2 text-[12px] font-medium text-[#6f6149] dark:text-[#c7b69c]">
                              <span
                                aria-hidden="true"
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: level.color }}
                              />
                              {level.label}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                Tap a day to see the symptoms and severity recorded.
              </p>
            )}
          </div>

          {dangerSigns.length > 0 && (
            <section
              aria-label="Danger signs recorded"
              className="mt-5 overflow-hidden rounded-[24px] border border-[#e8a18f] bg-[linear-gradient(155deg,rgba(250,232,224,0.94),rgba(246,224,216,0.78))] p-5 shadow-[0_14px_34px_-22px_rgba(156,58,41,0.22)] dark:border-[#d9715b]/45 dark:bg-[linear-gradient(155deg,rgba(78,29,22,0.84),rgba(50,19,14,0.88))]"
            >
              <div className="mb-4 flex items-center justify-between gap-2.5">
                <h3 className="flex min-w-0 items-center gap-2.5 text-[19px] font-semibold tracking-tight text-[#63281d] dark:text-[#fde8e1]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b74835] text-[#fff7f2] shadow-[0_3px_9px_rgba(156,58,41,0.22)]">
                    <AlertTriangle size={18} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  Danger signs
                </h3>
                <span className="shrink-0 rounded-full bg-[#7d2b1c] px-3 py-1.5 text-[12px] font-semibold tracking-tight text-[#fff7f2] dark:bg-[#c65a45]">
                  {dangerSigns.length} total · {dangerDays.size} days
                </span>
              </div>
              <ul className="space-y-3">
                {dangerSigns.map((sign) => (
                  <li
                    key={`${sign.name}-${sign.day}`}
                    className="rounded-[19px] border border-white/65 bg-[#fffaf6]/80 px-4 py-3.5 shadow-[0_4px_14px_-12px_rgba(118,52,34,0.36)] dark:border-white/10 dark:bg-[#1a100d]/75"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15.5px] font-semibold leading-snug text-[#63281d] dark:text-[#fde8e1]">
                          {sign.name}
                        </p>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-[#8d3d2b] dark:text-[#eab0a2]">
                          {sign.detail}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#e8a18f] bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-[#7d2b1c] dark:border-[#d9715b]/45 dark:bg-[#3f1913] dark:text-[#fde8e1]">
                        Sept {sign.day}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-[1.65] text-[#8d3d2b] dark:text-[#eab0a2]">
                If any of these happen again, contact your midwife or go to your nearest facility
                right away — don&apos;t wait for your next appointment.
              </p>
            </section>
          )}

          <div className="mt-5 border-t border-[#e2d3b4] pt-4 dark:border-[#3d3123]">
            <h3 className="text-[19px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              Most frequent
            </h3>
            <div className="mt-3">
              <SymptomBars rows={topSymptoms} />
            </div>
          </div>
        </Section>

        {/* Nutrition */}
        <Section
          title="Food groups"
          note={`${AVG_FOOD_GROUPS} of 5 groups on an average day`}
          revealDelay={230}
        >
          <FoodScoreDonut
            counts={FOOD_GROUPS.map((_, i) => MONTH.filter((d) => d.foodGroups.includes(i)).length)}
            score={AVG_FOOD_GROUPS * 1.9}
          />

          <p className="mt-4 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            All five food groups were eaten on{" "}
            <span className="font-semibold text-[#3b3226] dark:text-[#f5ede0]">
              {FOOD_COVERAGE_DAYS} days
            </span>{" "}
            this month.
          </p>
        </Section>

        {/* Supplements */}
        <Section title="Supplements" note="Days taken this month" revealDelay={310}>
          <SupplementAdherence supplements={SUPPLEMENT_REPORTS} />
        </Section>

        {/* Clinician summary */}
        <section
          className={`report-reveal mt-4 rounded-[26px] border p-5 shadow-[0_14px_34px_-22px_rgba(120,85,30,0.5)] backdrop-blur-xl dark:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.82)] ${
            dangerSigns.length
              ? "border-[#c65a45]/50 bg-[#f6e0d8]/70 dark:border-[#d9715b]/45 dark:bg-[#361712]/80"
              : "border-white/70 bg-white/70 dark:border-[#e5be79]/16 dark:bg-[#221c15]/82"
          }`}
          style={{ "--reveal-delay": "390ms" } as CSSProperties}
        >
          <h2
            className={`text-[19px] font-medium tracking-tight ${
              dangerSigns.length
                ? "text-[#7d2b1c] dark:text-[#fde8e1]"
                : "text-[#3b3226] dark:text-[#f5ede0]"
            }`}
          >
            Summary
          </h2>
          <p
            className={`mt-3 text-[14.5px] leading-[1.7] ${
              dangerSigns.length
                ? "text-[#5c3a2e] dark:text-[#f0c7bc]"
                : "text-[#4a3f30] dark:text-[#dfcfb6]"
            }`}
          >
            Over this reporting period, {leading.name.toLowerCase()} was the most frequently
            reported symptom ({leading.count} days, averaging {leading.avg}/3 in severity) and eased
            noticeably after the second week. Diet widened from an average of 3 groups early in the
            month to all five on {FOOD_COVERAGE_DAYS} days.{" "}
            {SUPPLEMENT_REPORTS.map((supplement) =>
              supplement.percent === null
                ? `No ${supplement.name.toLowerCase()} entries were logged.`
                : `${supplement.name} was marked taken on ${supplement.percent}% of its logged days.`,
            ).join(" ")}{" "}
            Review these entries together at your {report.appointment}.
          </p>
          {dangerSigns.length > 0 && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-[14px] bg-[#9c3a29]/10 px-3 py-2.5 text-[13px] leading-relaxed text-[#7d2b1c] dark:bg-[#c65a45]/20 dark:text-[#fde8e1]"
            >
              <AlertTriangle
                size={16}
                strokeWidth={2.2}
                className="mt-0.5 shrink-0 text-[#9c3a29] dark:text-[#f08b75]"
                aria-hidden="true"
              />
              <span>
                <span className="font-semibold">{dangerSigns.length} danger signs</span> were
                recorded and should be reviewed with your clinician. Persistent or worsening signs
                need prompt follow-up.
              </span>
            </p>
          )}
          <p className="mt-4 text-[12.5px] italic text-[#85735a] dark:text-[#a8967b]">
            Generated from {TOTAL_DAYS - report.daysMissed} voice check-ins. Bring any questions to
            your appointment.
          </p>
          <p className="mt-4 border-t border-[#e2d3b4] pt-3 text-[12.5px] whitespace-pre-wrap text-[#6f6149] dark:border-[#3d3123] dark:text-[#a8967b]">
            Generated at {report.generatedAt}
          </p>
        </section>
      </div>
    </div>
  );
}

function Section({
  title,
  note,
  revealDelay = 0,
  children,
}: {
  title: string;
  note: string;
  revealDelay?: number;
  children: ReactNode;
}) {
  return (
    <section
      className="report-reveal mt-4 rounded-[26px] border border-white/70 bg-white/70 p-5 shadow-[0_14px_34px_-22px_rgba(120,85,30,0.5)] backdrop-blur-xl dark:border-[#e5be79]/16 dark:bg-[#221c15]/82 dark:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.82)]"
      style={{ "--reveal-delay": `${revealDelay}ms` } as CSSProperties}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[19px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
          {title}
        </h2>
        <span className="text-right text-[12px] text-[#85735a] dark:text-[#9c8b72]">{note}</span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
