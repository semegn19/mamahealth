export type ReportStatus = "ready" | "reviewed";

export type DangerSign = {
  name: string;
  detail: string;
  day: number;
  severity: "High" | "Critical";
};

export type ReportArchiveItem = {
  id: string;
  appointment: string;
  range: string;
  generatedAt: string;
  clinician: string;
  checkinRate: number;
  daysMissed: number;
  summary: string;
  status: ReportStatus;
  /** Critical signs that were flagged during the reporting period. */
  dangerSigns?: DangerSign[];
};

export const REPORT_ARCHIVE: ReportArchiveItem[] = [
  {
    id: "fourth-appointment",
    appointment: "4th appointment",
    range: "Mon 1 Sep to Tue 30 Sep",
    generatedAt: "October 1, 2025  6:20 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 90,
    daysMissed: 3,
    summary:
      "Four danger signs were recorded across three days. Persistent headache and reduced fetal movement should be reviewed promptly.",
    status: "ready",
    dangerSigns: [
      { name: "Severe headache", detail: "Lasting 6+ hours, not eased by rest", day: 9, severity: "Critical" },
      { name: "Vaginal bleeding", detail: "Light spotting — reported same day", day: 18, severity: "High" },
      { name: "Reduced fetal movement", detail: "Fewer than 10 kicks in 2 hours", day: 24, severity: "Critical" },
      { name: "Severe abdominal pain", detail: "Lower abdomen, coming in waves", day: 24, severity: "Critical" },
    ],
  },
  {
    id: "third-appointment",
    appointment: "3rd appointment",
    range: "Thu 9 Oct to Wed Nov 8",
    generatedAt: "November 7, 2025  10:30 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 83,
    daysMissed: 5,
    summary: "Symptoms eased after the second week. Food variety and supplement consistency improved.",
    status: "ready",
  },
  {
    id: "second-appointment",
    appointment: "2nd appointment",
    range: "Tue 9 Sep to Wed 8 Oct",
    generatedAt: "October 8, 2025  8:15 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 80,
    daysMissed: 6,
    summary: "Morning nausea was the main pattern. Hydration and food-group variety remained steady.",
    status: "reviewed",
  },
  {
    id: "first-appointment",
    appointment: "1st appointment",
    range: "Sun 10 Aug to Mon 8 Sep",
    generatedAt: "September 8, 2025  7:40 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 73,
    daysMissed: 8,
    summary: "Early fatigue and nausea were frequently reported, with consistent folic-acid use.",
    status: "reviewed",
  },
];

export function getReportArchiveItem(id?: string | null) {
  return REPORT_ARCHIVE.find((report) => report.id === id) ?? REPORT_ARCHIVE[0];
}