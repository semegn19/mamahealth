export type ReportStatus = "ready" | "reviewed";

export type DangerSign = {
  category?: string;
  name: string;
  name_am?: string;
  detail: string;
  detail_am?: string;
  day: number;
  severity: "High" | "Critical";
};

export const DANGER_CANONICAL_MAP: Record<string, string> = {
  // Vaginal bleeding
  vaginal_bleeding: "vaginal_bleeding",
  "vaginal bleeding": "vaginal_bleeding",
  "የሴት ብልት ደም መፍሰስ": "vaginal_bleeding",

  // Severe headache
  severe_headache: "severe_headache",
  "severe headache": "severe_headache",
  "ጽኑ ራስ ምታት": "severe_headache",

  // Blurred vision
  blurred_vision: "blurred_vision",
  "blurred vision": "blurred_vision",
  "የእይታ ብዥታ": "blurred_vision",

  // Severe abdominal pain
  severe_abdominal_pain: "severe_abdominal_pain",
  "severe abdominal pain": "severe_abdominal_pain",
  "ከፍተኛ የሆድ ህመም": "severe_abdominal_pain",

  // High fever
  high_fever: "high_fever",
  "high fever": "high_fever",
  "ከፍተኛ ትኩሳት": "high_fever",

  // Fluid leakage
  fluid_leakage: "fluid_leakage",
  "fluid leakage": "fluid_leakage",
  "fluid leakage / water breaking": "fluid_leakage",
  "የፈሳሽ መፍሰስ": "fluid_leakage",

  // Swelling
  swelling_hands_face: "swelling_hands_face",
  swelling: "swelling_hands_face",
  "severe swelling of hands and face": "swelling_hands_face",
  "የእጅ እና የፊት እብጠት": "swelling_hands_face",

  // Difficulty breathing
  difficulty_breathing: "difficulty_breathing",
  "difficulty breathing": "difficulty_breathing",
  "የመተንፈስ ችግር": "difficulty_breathing",

  // Decreased baby movement
  abnormal_fetal_movement: "abnormal_fetal_movement",
  "decreased baby movement": "abnormal_fetal_movement",
  "የፅንስ እንቅስቃሴ መቀነስ": "abnormal_fetal_movement",

  // Vomiting
  persistent_nausea_vomiting: "persistent_nausea_vomiting",
  "persistent severe vomiting": "persistent_nausea_vomiting",
  "የማያቋርጥ ከባድ ማስታወክ": "persistent_nausea_vomiting",

  // Convulsions
  convulsions_loss_of_consciousness: "convulsions_loss_of_consciousness",
  "convulsions or fainting": "convulsions_loss_of_consciousness",
  "መንቀጥቀጥ ወይም ራስ መሳት": "convulsions_loss_of_consciousness",

  // Weakness or backache
  severe_weakness_or_backache: "severe_weakness_or_backache",
  "severe weakness or acute backache": "severe_weakness_or_backache",
  "ከፍተኛ ድካም ወይም የወገብ ህመም": "severe_weakness_or_backache",
};

export function getCanonicalDangerKey(sign: {
  category?: string | null;
  name?: string | null;
  name_am?: string | null;
  raw_text?: string | null;
}): string {
  const c = (sign.category || "").toLowerCase().trim();
  if (c && DANGER_CANONICAL_MAP[c]) return DANGER_CANONICAL_MAP[c];

  const n = (sign.name || "").toLowerCase().trim();
  if (n && DANGER_CANONICAL_MAP[n]) return DANGER_CANONICAL_MAP[n];

  const nam = (sign.name_am || "").toLowerCase().trim();
  if (nam && DANGER_CANONICAL_MAP[nam]) return DANGER_CANONICAL_MAP[nam];

  const raw = (sign.raw_text || "").toLowerCase().trim();
  if (raw && DANGER_CANONICAL_MAP[raw]) return DANGER_CANONICAL_MAP[raw];

  return c || n || nam || raw || "unknown_danger";
}

export function formatGeneratedDateTime(rawDate?: string | Date | null, isAmharic = false): string {
  if (!rawDate) return "";
  const d = typeof rawDate === "string" ? new Date(rawDate) : rawDate;
  if (isNaN(d.getTime())) return String(rawDate);

  const formattedDate = d.toLocaleDateString(isAmharic ? "am-ET" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = d.toLocaleTimeString(isAmharic ? "am-ET" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return isAmharic
    ? `${formattedDate}፣ ${formattedTime}`
    : `${formattedDate} at ${formattedTime}`;
}

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
  content_json?: any;
};

import type { BackendSummaryResponse } from "@/api/reports";

export const REPORT_ARCHIVE: ReportArchiveItem[] = [];

export function formatAncContactTitle(contactNum?: number | null, title?: string | null): string {
  const n = contactNum || 1;
  const suffix = n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
  const defaultTitle = `${suffix} ANC Contact`;
  if (!title) return defaultTitle;
  if (/WHO\s*Contact/i.test(title)) {
    return defaultTitle;
  }
  return title;
}

export function formatAncContactTitleAm(contactNum?: number | null, titleAm?: string | null): string {
  const n = contactNum || 1;
  const defaultTitle = `${n}ኛ የቅድመ ወሊድ ክትትል`;
  if (!titleAm) return defaultTitle;
  if (/የዓለም\s*ጤና\s*ድርጅት|WHO/i.test(titleAm)) {
    return defaultTitle;
  }
  return titleAm;
}

export function backendSummaryToArchiveItem(summary: BackendSummaryResponse): ReportArchiveItem {
  const cJson = (summary.content_json || {}) as Record<string, any>;
  const rawDangers: any[] = Array.isArray(cJson.danger_signs)
    ? cJson.danger_signs
    : Array.isArray(cJson.dangers)
      ? cJson.dangers
      : [];

  const periodEnd = summary.period_end ? new Date(summary.period_end) : new Date();
  const startWindow = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate() - 13);

  const seenDangers = new Set<string>();
  const mappedDangers: DangerSign[] = [];

  rawDangers.forEach((d: any, index: number) => {
    const canonicalKey = getCanonicalDangerKey(d);
    let dayNum = index + 1;
    if (d.date) {
      const dDate = new Date(d.date);
      const diff = Math.round((dDate.getTime() - startWindow.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 14) {
        dayNum = diff + 1;
      }
    }

    const key = `${dayNum}|${canonicalKey}`;
    if (seenDangers.has(key)) return;
    seenDangers.add(key);

    mappedDangers.push({
      category: d.category || canonicalKey,
      name: d.category_display_en || d.raw_text || "Danger sign",
      name_am: d.category_display || d.raw_text || "አስደንጋጭ ምልክት",
      detail: d.raw_text || "Reported during daily check-in session.",
      detail_am: d.raw_text || "በዕለታዊ ምዝገባ ወቅት የተገለጸ ምልክት።",
      day: dayNum,
      severity: (d.severity === "Critical" || d.severity === "severe" ? "Critical" : "High") as "High" | "Critical",
    });
  });

  const checkins =
    typeof cJson.checkin_count === "number"
      ? cJson.checkin_count
      : Array.isArray(cJson.recorded_symptoms) && cJson.recorded_symptoms.length > 0
        ? cJson.recorded_symptoms.length
        : mappedDangers.length > 0
          ? 1
          : 0;
  const rate = Math.min(100, Math.round((checkins / 14) * 100));

  return {
    id: summary.id,
    appointment: formatAncContactTitle(summary.anc_contact_number, summary.anc_contact_title),
    appointment_am: formatAncContactTitleAm(summary.anc_contact_number, summary.anc_contact_title_am),
    range: `${summary.period_start} – ${summary.period_end}`,
    range_am: `${summary.period_start} – ${summary.period_end}`,
    generatedAt: summary.generated_at,
    clinician: "Assigned Midwife / Health Post",
    checkinRate: rate,
    daysMissed: summary.content_json?.missed_days ?? Math.max(0, 14 - checkins),
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
    content_json: summary.content_json,
  };
}

export function getContactFromGestationalWeeks(weeks: number): { title_en: string; title_am: string; number: number } {
  if (weeks <= 12) return { number: 1, title_en: "1st ANC Contact", title_am: "1ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 20) return { number: 2, title_en: "2nd ANC Contact", title_am: "2ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 26) return { number: 3, title_en: "3rd ANC Contact", title_am: "3ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 30) return { number: 4, title_en: "4th ANC Contact", title_am: "4ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 34) return { number: 5, title_en: "5th ANC Contact", title_am: "5ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 36) return { number: 6, title_en: "6th ANC Contact", title_am: "6ኛ የቅድመ ወሊድ ክትትል" };
  if (weeks <= 38) return { number: 7, title_en: "7th ANC Contact", title_am: "7ኛ የቅድመ ወሊድ ክትትል" };
  return { number: 8, title_en: "8th ANC Contact", title_am: "8ኛ የቅድመ ወሊድ ክትትል" };
}

export function resolveCurrentAncContact(): { title_en: string; title_am: string; number: number } {
  return {
    number: 1,
    title_en: "1st ANC Contact",
    title_am: "1ኛ የቅድመ ወሊድ ክትትል",
  };
}

export function createDynamicReportFromCheckins(
  logs: any[],
  ancContact?: { title_en?: string; title_am?: string },
): ReportArchiveItem {
  const checkins = logs.length;
  const missed = Math.max(0, 14 - checkins);
  const rate = Math.min(100, Math.round((checkins / 14) * 100));

  const allDangers: DangerSign[] = [];
  logs.forEach((log, index) => {
    if (log.dangerSigns && Array.isArray(log.dangerSigns)) {
      log.dangerSigns.forEach((d: any) => {
        allDangers.push({
          name: d.name || "Danger sign",
          name_am: d.name_am || "አስደንጋጭ ምልክት",
          detail: d.detail || "Reported during check-in",
          detail_am: d.detail_am || "በምዝገባ ወቅት የተገለጸ",
          day: index + 1,
          severity: d.severity || "High",
        });
      });
    }
  });

  const defaultContact = resolveCurrentAncContact();
  const contactTitleEn = ancContact?.title_en || defaultContact.title_en;
  const contactTitleAm = ancContact?.title_am || defaultContact.title_am;

  const now = new Date();
  const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const rangeStr = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return {
    id: "current-period-report",
    appointment: contactTitleEn,
    appointment_am: contactTitleAm,
    range: rangeStr,
    range_am: rangeStr,
    generatedAt: now.toISOString(),
    clinician: "Assigned Midwife / Health Post",
    checkinRate: rate,
    daysMissed: missed,
    summary:
      allDangers.length > 0
        ? "Flagged symptoms recorded during this antenatal period require clinician attention."
        : "Routine antenatal check-in summary. Maternal health metrics and nutrition indicators recorded.",
    summary_am:
      allDangers.length > 0
        ? "በዚህ ወቅት የተመዘገቡ ምልክቶች የህክምና ባለሙያ ክትትል ያስፈልጋቸዋል።"
        : "መደበኛ የቅድመ ወሊድ ክትትል ማጠቃለያ። የእናቲቱ ጤና እና አመጋገብ ተመዝግቧል።",
    status: "ready",
    dangerSigns: allDangers.length > 0 ? allDangers : undefined,
  };
}

export function getReportArchiveItem(id?: string | null): ReportArchiveItem {
  const defaultContact = resolveCurrentAncContact();
  const now = new Date();
  return {
    id: id || "current-period-report",
    appointment: defaultContact.title_en,
    appointment_am: defaultContact.title_am,
    range: `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    range_am: `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    generatedAt: now.toISOString(),
    clinician: "Assigned Midwife / Health Post",
    checkinRate: 0,
    daysMissed: 0,
    summary: "No check-ins recorded for this antenatal period yet.",
    summary_am: "ለዚህ ወቅት እስካሁን የተመዘገበ ዕለታዊ ምዝገባ የለም።",
    status: "ready",
  };
}

export function deduplicateReports(list: ReportArchiveItem[]): ReportArchiveItem[] {
  const seenContacts = new Set<string>();
  const seenIds = new Set<string>();
  const result: ReportArchiveItem[] = [];

  for (const rep of list) {
    if (!rep || !rep.id) continue;
    if (seenIds.has(rep.id)) continue;

    // Normalize contact title, e.g. "1st anc contact" or "1ኛ የቅድመ ወሊድ ክትትል"
    const rawContact = (rep.appointment || "").toLowerCase().trim();
    const contactKey = rawContact.replace(
      /^(\d+)(?:st|nd|rd|th|ኛ)?\s+(?:anc\s+contact|የቅድመ\s+ወሊድ\s+ክትትል).*/i,
      "anc-$1",
    );

    if (contactKey && seenContacts.has(contactKey)) {
      continue;
    }

    seenIds.add(rep.id);
    if (contactKey) {
      seenContacts.add(contactKey);
    }
    result.push(rep);
  }
  return result;
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
      category: d.category,
      name: d.name_am ?? d.name,
      name_am: d.name_am,
      detail: d.detail_am ?? d.detail,
      detail_am: d.detail_am,
    })),
  };
}
