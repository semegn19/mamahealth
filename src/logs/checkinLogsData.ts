import type { CheckinDangerSign, CheckinEntry } from "../components/CheckinReportSheet";
import type { BackendCheckInHistoryItem } from "@/api/checkin";
import { getCanonicalDangerKey } from "../report/reportCatalog";
import {
  CHECKIN_STAGE_PROMPTS,
  translateSupplementName,
} from "../constants/checkinPrompts";

/**
 * A daily check-in log: the set of questions asked that day and what was recorded.
 * Backed by mock fixtures during prototyping; replaced by API history in production.
 */
export type CheckinLog = {
  id: string;
  date: Date;
  /** Morning or evening session. */
  session: "Morning" | "Evening";
  entries: CheckinEntry[];
  dangerSigns?: CheckinDangerSign[];
  supplement_check?: any[] | null;
  food_log?: any[] | null;
  symptoms?: any[] | null;
  danger_sign_triggered?: boolean;
  summary_text_en?: string | null;
  summary_text_am?: string | null;
};

export const CHECKIN_LOGS: CheckinLog[] = [];

const FOOD_GROUP_NAMES: Record<string, { en: string; am: string }> = {
  grains: { en: "Grains", am: "እህል" },
  proteins: { en: "Proteins", am: "ፕሮቲን" },
  dairy: { en: "Dairy", am: "የወተት ተዋጽኦ" },
  fruits_and_vegetables: { en: "Fruits & Vegetables", am: "አትክልት እና ፍራፍሬ" },
  fruit: { en: "Fruits", am: "ፍራፍሬ" },
  vegetables: { en: "Vegetables", am: "አትክልት" },
};

export function backendCheckinToFrontendLog(item: BackendCheckInHistoryItem): CheckinLog {
  const dateObj = new Date(item.timestamp || item.recorded_at || Date.now());
  const hours = dateObj.getHours();
  const session: "Morning" | "Evening" = hours < 14 ? "Morning" : "Evening";

  const dangerSigns: CheckinDangerSign[] = [];
  const seenDangerKeys = new Set<string>();
  if (item.symptoms && Array.isArray(item.symptoms)) {
    for (const s of item.symptoms) {
      if (
        s.danger_sign ||
        s.assessment === "recognized_danger_category" ||
        s.severity === "severe" ||
        s.severity === "Critical"
      ) {
        const canKey = getCanonicalDangerKey({
          category: s.category,
          name: s.category_display_en || s.raw_text,
          name_am: s.category_display || s.raw_text,
        });
        if (seenDangerKeys.has(canKey)) continue;
        seenDangerKeys.add(canKey);

        dangerSigns.push({
          category: s.category || canKey,
          name: s.category_display_en || s.category || s.raw_text || "Danger sign",
          name_am: s.category_display || s.raw_text || "አስደንጋጭ ምልክት",
          detail: s.raw_text || (s.duration ? `Duration: ${s.duration}` : "Reported during check-in"),
          detail_am: s.raw_text || "በምዝገባ ወቅት የተገለጸ ምልክት",
          severity: s.severity === "Critical" ? "Critical" : "High",
        });
      }
    }
  }

  if (item.danger_sign_triggered && dangerSigns.length === 0) {
    const canKey = getCanonicalDangerKey({
      name: item.summary_text_en,
      name_am: item.summary_text_am,
    });
    dangerSigns.push({
      category: canKey,
      name: item.summary_text_en || "Reported clinical danger sign",
      name_am: item.summary_text_am || "የተመዘገበ የአደጋ ምልክት",
      detail: item.summary_text_en || "Clinical danger sign triggered during check-in",
      detail_am: item.summary_text_am || "በምዝገባ ወቅት የተገኘ የአደጋ ምልክት",
      severity: "Critical",
    });
  }

  const isDangerEarlyExit = Boolean(item.danger_sign_triggered || dangerSigns.length > 0);
  const entries: CheckinEntry[] = [];

  // Stage 0: Symptoms / Danger Signs
  const rawSymptoms = Array.isArray(item.symptoms) ? item.symptoms : [];
  const validSymptoms = rawSymptoms.filter((s) => {
    const txt = (s.raw_text || s.category_display_en || s.category || "").trim();
    if (!txt) return false;
    if (txt.toLowerCase() === "no symptoms reported. feeling well.") return false;
    return true;
  });

  const hasSymptoms = validSymptoms.length > 0;
  const symptomAnswerEn = dangerSigns.length > 0
    ? dangerSigns.map((d) => d.name || d.detail).join(", ")
    : hasSymptoms
      ? validSymptoms.map((s) => s.category_display_en || s.raw_text).filter(Boolean).join(", ")
      : "No symptoms reported. Feeling well.";

  const symptomAnswerAm = dangerSigns.length > 0
    ? dangerSigns.map((d) => d.name_am || d.detail_am || d.name).join("፣ ")
    : hasSymptoms
      ? validSymptoms.map((s) => s.category_display || s.raw_text).filter(Boolean).join("፣ ")
      : "ምንም የታመመ ምልክት የለም። ደህና ነኝ።";

  entries.push({
    question: CHECKIN_STAGE_PROMPTS.symptoms.prompt_en,
    question_am: CHECKIN_STAGE_PROMPTS.symptoms.prompt_am,
    answer: symptomAnswerEn,
    answer_am: symptomAnswerAm,
    severity: dangerSigns.length > 0 ? 80 : hasSymptoms ? 40 : null,
    skipped: false,
  });

  // Stage 1: Food & Nutrition
  const rawFood = Array.isArray(item.food_log) ? item.food_log : [];
  const hasFood =
    rawFood.length > 0 &&
    !rawFood.every((f: any) => String(f?.raw_text || "").toLowerCase() === "skipped");

  if (isDangerEarlyExit && !hasFood) {
    entries.push({
      question: CHECKIN_STAGE_PROMPTS.food.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.food.prompt_am,
      answer: "Check-in stopped early due to clinical danger sign",
      answer_am: "በአስቸኳይ የአደጋ ምልክት ምክንያት ምዝገባው ተቋርጧል",
      severity: null,
      skipped: true,
    });
  } else {
    const formatFoodItem = (f: any, isAm: boolean) => {
      const groups = Array.isArray(f.food_groups)
        ? f.food_groups.map((g: string) => isAm ? (FOOD_GROUP_NAMES[g.toLowerCase()]?.am || g) : (FOOD_GROUP_NAMES[g.toLowerCase()]?.en || g)).join(isAm ? "፣ " : ", ")
        : "";
      if (groups && f.raw_text && f.raw_text !== groups) {
        return `${groups} (${f.raw_text})`;
      }
      return groups || f.raw_text || (isAm ? "መደበኛ ምግብ" : "Regular meal");
    };

    entries.push({
      question: CHECKIN_STAGE_PROMPTS.food.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.food.prompt_am,
      answer: hasFood
        ? rawFood.map((f) => formatFoodItem(f, false)).filter(Boolean).join(", ")
        : "Logged regular meals.",
      answer_am: hasFood
        ? rawFood.map((f) => formatFoodItem(f, true)).filter(Boolean).join("፣ ")
        : "መደበኛ ምግብ ተመግቤያለሁ።",
      severity: null,
      skipped: !hasFood,
    });
  }

  // Stage 2: Prenatal Supplements
  const rawSupplements = Array.isArray(item.supplement_check) ? item.supplement_check : [];
  const hasSupplements =
    rawSupplements.length > 0 &&
    !rawSupplements.every((s: any) => String(s?.raw_text || "").toLowerCase() === "skipped");

  if (isDangerEarlyExit && !hasSupplements) {
    entries.push({
      question: CHECKIN_STAGE_PROMPTS.supplement.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.supplement.prompt_am,
      answer: "Check-in stopped early due to clinical danger sign",
      answer_am: "በአስቸኳይ የአደጋ ምልክት ምክንያት ምዝገባው ተቋርጧል",
      severity: null,
      skipped: true,
    });
  } else if (hasSupplements) {
    const formatSup = (s: any, isAm: boolean) => {
      const rawName = s.supplement_name || s.name || (isAm ? "ቫይታሚን" : "Supplement");
      const sName = translateSupplementName(rawName, isAm);
      const isTaken =
        typeof s.taken === "boolean"
          ? s.taken
          : typeof s.taken_today === "boolean"
            ? s.taken_today
            : false;
      const status = isAm
        ? isTaken ? "ተወስዷል" : "አልተወሰደም"
        : isTaken ? "Taken" : "Not taken";
      return `${sName} (${status})`;
    };

    entries.push({
      question: CHECKIN_STAGE_PROMPTS.supplement.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.supplement.prompt_am,
      answer: rawSupplements.map((s) => formatSup(s, false)).join(", "),
      answer_am: rawSupplements.map((s) => formatSup(s, true)).join("፣ "),
      severity: null,
      skipped: false,
    });
  } else {
    entries.push({
      question: CHECKIN_STAGE_PROMPTS.supplement.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.supplement.prompt_am,
      answer: "No supplement check recorded",
      answer_am: "ምንም የእንክብል መረጃ አልተመዘገበም",
      severity: null,
      skipped: true,
    });
  }

  // Stage 3: Closing / Questions
  const rawClosing = Array.isArray(item.closing_mentions) ? item.closing_mentions : [];
  const hasClosing =
    rawClosing.length > 0 &&
    !rawClosing.every((c: any) => String(c?.raw_text || "").toLowerCase() === "skipped");
  const hasSummary = Boolean(item.summary_text_en || item.summary_text_am);

  if (isDangerEarlyExit && !hasClosing && !hasSummary) {
    entries.push({
      question: CHECKIN_STAGE_PROMPTS.closing.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.closing.prompt_am,
      answer: "Check-in stopped early due to clinical danger sign",
      answer_am: "በአስቸኳይ የአደጋ ምልክት ምክንያት ምዝገባው ተቋርጧል",
      severity: null,
      skipped: true,
    });
  } else {
    const closingTextEn = hasClosing
      ? rawClosing.map((c: any) => c?.raw_text).filter(Boolean).join("; ")
      : item.summary_text_en || "Check-in completed successfully.";
    const closingTextAm = hasClosing
      ? rawClosing.map((c: any) => c?.raw_text).filter(Boolean).join("፤ ")
      : item.summary_text_am || "ምዝገባው በተሳካ ሁኔታ ተጠናቋል።";

    entries.push({
      question: CHECKIN_STAGE_PROMPTS.closing.prompt_en,
      question_am: CHECKIN_STAGE_PROMPTS.closing.prompt_am,
      answer: closingTextEn,
      answer_am: closingTextAm,
      severity: null,
      skipped: !hasClosing && !hasSummary,
    });
  }

  return {
    id: item.id,
    date: dateObj,
    session,
    entries,
    dangerSigns: dangerSigns.length > 0 ? dangerSigns : undefined,
    supplement_check: item.supplement_check,
    food_log: item.food_log,
    symptoms: item.symptoms,
    danger_sign_triggered: item.danger_sign_triggered,
    summary_text_en: item.summary_text_en,
    summary_text_am: item.summary_text_am,
  };
}
