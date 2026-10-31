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

export const REPORT_ARCHIVE: ReportArchiveItem[] = [
  {
    id: "fourth-appointment",
    appointment: "4th appointment",
    appointment_am: "4ኛ የቅድመ ወሊድ ክትትል",
    range: "Mon 1 Sep to Tue 30 Sep",
    range_am: "ከሰኞ ጳጉሜ 1 እስከ ማክሰኞ መስከረም 30",
    generatedAt: "October 1, 2025  6:20 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 90,
    daysMissed: 3,
    summary:
      "Four danger signs were recorded across three days. Persistent headache and reduced fetal movement should be reviewed promptly.",
    summary_am:
      "በሦስት ቀናት ውስጥ 4 የአደጋ ምልክቶች ተመዝግበዋል። ተደጋጋሚ ራስ ምታት እና የፅንስ እንቅስቃሴ መቀነስ በአፋጣኝ በሐኪም መታየት አለባቸው።",
    status: "ready",
    dangerSigns: [
      {
        name: "Severe headache",
        name_am: "ጽኑ ራስ ምታት",
        detail: "Lasting 6+ hours, not eased by rest",
        detail_am: "ከ6 ሰዓታት በላይ የቆየ፣ በእረፍት ያልቀለለ",
        day: 9,
        severity: "Critical",
      },
      {
        name: "Vaginal bleeding",
        name_am: "የደም መፍሰስ",
        detail: "Light spotting — reported same day",
        detail_am: "ቀላል የደም ጠብታ — በዕለቱ ሪፖርት የተደረገ",
        day: 18,
        severity: "High",
      },
      {
        name: "Reduced fetal movement",
        name_am: "የፅንስ እንቅስቃሴ መቀነስ",
        detail: "Fewer than 10 kicks in 2 hours",
        detail_am: "በ2 ሰዓታት ውስጥ ከ10 ምቶች በታች",
        day: 24,
        severity: "Critical",
      },
      {
        name: "Severe abdominal pain",
        name_am: "ከፍተኛ የሆድ ህመም",
        detail: "Lower abdomen, coming in waves",
        detail_am: "በማዕበል መልክ የሚመጣ የታችኛው ሆድ ህመም",
        day: 24,
        severity: "Critical",
      },
    ],
  },
  {
    id: "third-appointment",
    appointment: "3rd appointment",
    appointment_am: "3ኛ የቅድመ ወሊድ ክትትል",
    range: "Thu 9 Oct to Wed Nov 8",
    range_am: "ከሐሙስ ጥቅምት 9 እስከ ረቡዕ ህዳር 8",
    generatedAt: "November 7, 2025  10:30 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 83,
    daysMissed: 5,
    summary: "Symptoms eased after the second week. Food variety and supplement consistency improved.",
    summary_am: "ከሁለተኛው ሳምንት በኋላ ምልክቶች ቀለል ብለዋል። የተመጣጠነ ምግብ ብዝሃነት እና የእንክብል አወሳሰድ ተሻሽሏል።",
    status: "ready",
  },
  {
    id: "second-appointment",
    appointment: "2nd appointment",
    appointment_am: "2ኛ የቅድመ ወሊድ ክትትል",
    range: "Tue 9 Sep to Wed 8 Oct",
    range_am: "ከማክሰኞ መስከረም 9 እስከ ረቡዕ ጥቅምት 8",
    generatedAt: "October 8, 2025  8:15 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 80,
    daysMissed: 6,
    summary: "Morning nausea was the main pattern. Hydration and food-group variety remained steady.",
    summary_am: "የጠዋት ማቅለሽለሽ ዋነኛው ምልክት ነበር። ፈሳሽ አወሳሰድ እና የተመጣጠነ ምግብ አጠቃቀም ቋሚ ነበር።",
    status: "reviewed",
  },
  {
    id: "first-appointment",
    appointment: "1st appointment",
    appointment_am: "1ኛ የቅድመ ወሊድ ክትትል",
    range: "Sun 10 Aug to Mon 8 Sep",
    range_am: "ከእሁድ ነሐሴ 10 እስከ ሰኞ መስከረም 8",
    generatedAt: "September 8, 2025  7:40 pm",
    clinician: "Dr. Naomi Adeyemi",
    checkinRate: 73,
    daysMissed: 8,
    summary: "Early fatigue and nausea were frequently reported, with consistent folic-acid use.",
    summary_am: "የመጀመሪያ ድካም እና ማቅለሽለሽ በብዛት ተመዝግቧል፣ የፎሊክ አሲድ አወሳሰድ ወጥ ነበር።",
    status: "reviewed",
  },
];

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
