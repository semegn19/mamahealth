import { AlertTriangle, X } from "lucide-react";

/** A single answered (or skipped) check-in question, as captured by voice. */
export type CheckinEntry = {
  question: string;
  answer: string | null;
  severity: number | null;
  skipped: boolean;
};

export type CheckinDangerSign = {
  name: string;
  detail: string;
  severity: "High" | "Critical";
};

export function severityLabel(value: number) {
  if (value <= 33) return "Mild";
  if (value <= 66) return "Moderate";
  return "Severe";
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
  emptyMessage = "No questions answered yet.",
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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b3226]/20 dark:bg-black/68 px-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-report-title"
      onClick={onClose}
    >
      <div
        className="report-sheet max-h-[84dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[30px] border border-white/80 bg-[#f3ecdf]/96 p-5 pb-8 shadow-[0_-18px_50px_-25px_rgba(85,55,18,0.5)] backdrop-blur-xl sm:rounded-[30px] sm:p-6 dark:border-[#e5be79]/20 dark:bg-[#15120e]/96 dark:shadow-[0_-18px_50px_-20px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="checkin-report-title"
              className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]"
            >
              {title}
            </h2>
            {eyebrow && (
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8d6a2a] dark:text-[#dfb870]">
                {eyebrow}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close check-in detail"
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {dangerSigns.length > 0 && (
            <section
              aria-label="Danger signs recorded"
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
                    Danger sign recorded
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8a3b2c] dark:text-[#eab0a2]">
                    Please contact your midwife or care team promptly to review this sign. If it is
                    ongoing or worsening, seek urgent care.
                  </p>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-[#c65a45]/15 border-t border-[#c65a45]/15 dark:divide-[#d9715b]/18 dark:border-[#d9715b]/18">
                {dangerSigns.map((sign) => (
                  <li key={sign.name} className="pt-3.5 first:pt-3.5">
                    <p className="text-[15px] font-medium text-[#63281d] dark:text-[#fde8e1]">
                      {sign.name}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#8d3d2b] dark:text-[#eab0a2]">
                      {sign.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Recorded responses">
            <h3 className="text-[18px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              Responses
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              Questions and answers from this check-in.
            </p>

            {entries.length === 0 ? (
              <p className="mt-4 py-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {emptyMessage}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#b98a3e]/15 border-t border-[#b98a3e]/15 dark:divide-[#e5be79]/12 dark:border-[#e5be79]/12">
                {entries.map((entry, index) => {
                  const severity = entry.severity ?? 50;
                  return (
                    <li
                      key={`${entry.question}-${index}`}
                      className="py-3.5 first:pt-3.5 last:pb-0"
                    >
                      <p className="text-[12.5px] font-medium text-[#6f6149] dark:text-[#b9a88e]">
                        {entry.question}
                      </p>
                      {entry.skipped ? (
                        <p className="mt-1 text-[14.5px] italic text-[#9b8a6f] dark:text-[#86765f]">
                          Skipped
                        </p>
                      ) : (
                        <>
                          <p className="mt-1 text-[15px] leading-relaxed text-[#3b3226] dark:text-[#f5ede0]">
                            {entry.answer}
                          </p>
                          {entry.severity !== null && (
                            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-[#85735a] dark:text-[#9c8b72]">
                              <span
                                aria-hidden="true"
                                className={`h-1.5 w-1.5 rounded-full ${severityDotColor(severity)}`}
                              />
                              {severityLabel(severity)} severity
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
    </div>
  );
}
