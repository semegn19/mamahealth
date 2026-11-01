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

export const REPORT_ARCHIVE: ReportArchiveItem[] = MOCK_REPORT_ARCHIVE;

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
