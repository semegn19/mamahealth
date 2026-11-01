export type ReportStatus = "ready" | "reviewed";

export type DangerSign = {
  name: string;
  name_am?: string;
  detail: string;
  detail_am?: string;
  day: number;
  severity: "High" | "Critical";
};

export type ReportArchiveItem = {
  id: string;
  appointment: string;
  appointment_am?: string;
  range: string;
  range_am?: string;
  generatedAt: string;
  clinician: string;
  checkinRate: number;
  daysMissed: number;
  summary: string;
  summary_am?: string;
  status: ReportStatus;
  /** Critical signs that were flagged during the reporting period. */
  dangerSigns?: DangerSign[];
};

import { MOCK_REPORT_ARCHIVE } from "../mock/reports";
import type { BackendSummaryResponse } from "@/api/reports";

export const REPORT_ARCHIVE: ReportArchiveItem[] = MOCK_REPORT_ARCHIVE;

export function backendSummaryToArchiveItem(summary: BackendSummaryResponse): ReportArchiveItem {
  const dangers = summary.content_json?.dangers ?? [];
  const mappedDangers: DangerSign[] = dangers.map((d, index) => ({
    name: d.category_display_en || d.raw_text || "Reported danger symptom",
    name_am: d.category_display || d.raw_text || "የተመዘገበ አስደንጋጭ ምልክት",
    detail: d.raw_text || "Reported during daily check-in session.",
    detail_am: d.raw_text || "በዕለታዊ ምዝገባ ወቅት የተገለጸ ምልክት።",
    day: index + 1,
    severity: (d.severity === "Critical" ? "Critical" : "High") as "High" | "Critical",
  }));

  const checkins = summary.content_json?.checkin_count ?? 12;
  const rate = Math.min(100, Math.round((checkins / 14) * 100));

  return {
    id: summary.id,
    appointment: summary.anc_contact_title || `WHO Contact ${summary.anc_contact_number || 1}`,
    appointment_am: summary.anc_contact_title_am || `የዓለም ጤና ድርጅት ግንኙነት ${summary.anc_contact_number || 1}`,
    range: `${summary.period_start} – ${summary.period_end}`,
    range_am: `${summary.period_start} – ${summary.period_end}`,
    generatedAt: summary.generated_at,
    clinician: "Assigned Midwife / Health Post",
    checkinRate: rate,
    daysMissed: summary.content_json?.missed_days ?? 2,
    summary:
      mappedDangers.length > 0
        ? "Flagged symptoms recorded during this antenatal period require clinician attention."
        : "Routine antenatal check-in summary. Maternal health metrics and nutrition indicators recorded.",
    summary_am:
      mappedDangers.length > 0
        ? "በዚህ ወቅት የተመዘገቡ ምልክቶች የህክምና ባለሙያ ክትትል ያስፈልጋቸዋል።"
        : "መደበኛ የቅድመ ወሊድ ክትትል ማጠቃለያ። የእናቲቱ ጤና እና አመጋገብ ተመዝግቧል።",
    status: "ready",
    dangerSigns: mappedDangers.length > 0 ? mappedDangers : undefined,
  };
}

export function getReportArchiveItem(id?: string | null) {
  return REPORT_ARCHIVE.find((report) => report.id === id) ?? REPORT_ARCHIVE[0];
}

export function getLocalizedReport(report: ReportArchiveItem, isAmharic: boolean): ReportArchiveItem {
  if (!isAmharic) return report;
  return {
    ...report,
    appointment: report.appointment_am ?? report.appointment,
    range: report.range_am ?? report.range,
    summary: report.summary_am ?? report.summary,
    dangerSigns: report.dangerSigns?.map((d) => ({
      ...d,
      name: d.name_am ?? d.name,
      detail: d.detail_am ?? d.detail,
    })),
  };
}
