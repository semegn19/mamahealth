"use client";

import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "./languageStore";
import { ModalDialog } from "./ModalDialog";

/** A single answered (or skipped) check-in question, as captured by voice. */
export type CheckinEntry = {
  question: string;
  question_am?: string;
  answer: string | null;
  answer_am?: string | null;
  severity: number | null;
  skipped: boolean;
};

export type CheckinDangerSign = {
  category?: string;
  name: string;
  name_am?: string;
  detail: string;
  detail_am?: string;
  severity: "High" | "Critical";
};

export function severityLabel(value: number, isAmharic: boolean) {
  if (value <= 33) return isAmharic ? "ቀላል" : "Mild";
  if (value <= 66) return isAmharic ? "መካከለኛ" : "Moderate";
  return isAmharic ? "ከፍተኛ" : "Severe";
}

function severityDotColor(value: number) {
  if (value <= 33) return "bg-[#c9a35d] dark:bg-[#e5be79]";
  if (value <= 66) return "bg-[#b97a32] dark:bg-[#df9f53]";
  return "bg-[#b74835] dark:bg-[#e4725c]";
}

/**
 * Bottom sheet listing a check-in's Q&A using the Settings-page glass card
 * and hairline-divider style, with all questions grouped inside one card.
 */
export function CheckinReportSheet({
  open,
  onClose,
  eyebrow,
  title,
  entries,
  emptyMessage,
  dangerSigns = [],
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  entries: CheckinEntry[];
  emptyMessage?: string;
  dangerSigns?: CheckinDangerSign[];
}) {
  const { t, isAmharic } = useTranslation();
  if (!open) return null;

  const defaultEmpty = emptyMessage ?? t("logs.emptyDetail");

  // Safeguard: deduplicate entries in case any existing or legacy entries have duplicate questions
  const uniqueEntries = entries.reduce<CheckinEntry[]>((acc, entry) => {
    const isDup = acc.some(
      (existing) =>
        (existing.question && entry.question && existing.question.trim().toLowerCase() === entry.question.trim().toLowerCase()) ||
        (existing.question_am && entry.question_am && existing.question_am.trim() === entry.question_am.trim())
    );
    if (!isDup) {
      acc.push(entry);
    }
    return acc;
  }, []);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      ariaLabelledBy="checkin-report-title"
      containerClassName="max-w-[460px]"
    >
      <div
        className="report-sheet home-glass-warm max-h-[90dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[30px] p-6 pb-[max(28px,env(safe-area-inset-bottom))] sm:rounded-[30px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="checkin-report-title"
              className="text-[24px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
            >
              {title}
            </h2>
            {eyebrow && (
              <p className="mt-1 text-[13px] font-medium text-[#8d6a2a] dark:text-[#dfb870]">
                {eyebrow}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition active:scale-95"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {dangerSigns.length > 0 && (
            <section
              aria-label={t("logs.dangerRecordedTitle")}
              className="home-glass rounded-[26px] !border-[#c65a45]/35 p-5 sm:p-6 dark:!border-[#d9715b]/38"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full bg-[#9c3a29]/12 text-[#9c3a29] dark:bg-[#c65a45]/20 dark:text-[#f08b75]"
                >
                  <AlertTriangle size={18} strokeWidth={1.85} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[18px] font-medium tracking-tight text-[#7d2b1c] dark:text-[#fde8e1]">
                    {t("logs.dangerRecordedTitle")}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8a3b2c] dark:text-[#eab0a2]">
                    {t("logs.dangerRecordedAdvice")}
                  </p>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-[#c65a45]/15 border-t border-[#c65a45]/15 dark:divide-[#d9715b]/18 dark:border-[#d9715b]/18">
                {dangerSigns.map((sign, idx) => (
                  <li key={`${sign.name}-${idx}`} className="pt-3.5 first:pt-3.5">
                    <p className="text-[15px] font-medium text-[#63281d] dark:text-[#fde8e1]">
                      {isAmharic ? (sign.name_am ?? sign.name) : sign.name}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#8d3d2b] dark:text-[#eab0a2]">
                      {isAmharic ? (sign.detail_am ?? sign.detail) : sign.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label={t("logs.responsesTitle")}>
            <h3 className="text-[18px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              {t("logs.responsesTitle")}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              {t("logs.responsesSubtitle")}
            </p>

            {uniqueEntries.length === 0 ? (
              <p className="mt-4 py-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {defaultEmpty}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#b98a3e]/15 border-t border-[#b98a3e]/15 dark:divide-[#e5be79]/12 dark:border-[#e5be79]/12">
                {uniqueEntries.map((entry, index) => {
                  const severity = entry.severity ?? 50;
                  const displayQ = isAmharic ? (entry.question_am ?? entry.question) : entry.question;
                  const displayA = isAmharic ? (entry.answer_am ?? entry.answer) : entry.answer;

                  return (
                    <li
                      key={`${entry.question}-${index}`}
                      className="py-3.5 first:pt-3.5 last:pb-0"
                    >
                      <p className="text-[12.5px] font-medium text-[#6f6149] dark:text-[#b9a88e]">
                        {displayQ}
                      </p>
                      {entry.skipped ? (
                        <p className="mt-1 text-[14.5px] italic text-[#9b8a6f] dark:text-[#86765f]">
                          {displayA || t("logs.skipped")}
                        </p>
                      ) : (
                        <>
                          <p className="mt-1 text-[15px] leading-relaxed text-[#3b3226] dark:text-[#f5ede0]">
                            {displayA}
                          </p>
                          {entry.severity !== null && (
                            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-[#85735a] dark:text-[#9c8b72]">
                              <span
                                aria-hidden="true"
                                className={`h-1.5 w-1.5 rounded-full ${severityDotColor(severity)}`}
                              />
                              {t("logs.severityBadge", {
                                severity: severityLabel(severity, isAmharic),
                              })}
                            </p>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </ModalDialog>
  );
}
