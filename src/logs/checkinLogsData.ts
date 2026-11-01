import type { CheckinDangerSign, CheckinEntry } from "../components/CheckinReportSheet";
import { MOCK_CHECKIN_LOGS } from "../mock/checkinLogs";
import type { BackendCheckInHistoryItem } from "@/api/checkin";

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
};

export const CHECKIN_LOGS: CheckinLog[] = MOCK_CHECKIN_LOGS;

export function backendCheckinToFrontendLog(item: BackendCheckInHistoryItem): CheckinLog {
  const dateObj = new Date(item.timestamp || item.recorded_at || Date.now());
  const hours = dateObj.getHours();
  const session: "Morning" | "Evening" = hours < 14 ? "Morning" : "Evening";

  const dangerSigns: CheckinDangerSign[] = [];
  if (item.symptoms && Array.isArray(item.symptoms)) {
    for (const s of item.symptoms) {
      if (
        s.danger_sign ||
        s.assessment === "recognized_danger_category" ||
        s.severity === "severe" ||
        s.severity === "Critical"
      ) {
        dangerSigns.push({
          name: s.category_display_en || s.category || s.raw_text || "Danger sign",
          name_am: s.category_display || s.raw_text || "አስደንጋጭ ምልክት",
          detail: s.raw_text || (s.duration ? `Duration: ${s.duration}` : "Reported during check-in"),
          detail_am: s.raw_text || "በምዝገባ ወቅት የተገለጸ ምልክት",
          severity: s.severity === "Critical" ? "Critical" : "High",
        });
      }
    }
  }

  const entries: CheckinEntry[] = [];

  // Symptoms
  const hasSymptoms = item.symptoms && item.symptoms.length > 0;
  entries.push({
    question: "How have you been feeling since our last talk?",
    question_am: "ባለፈው ከተነጋገርን ጀምሮ የጤና ሁኔታዎ እንዴት ነው?",
    answer: hasSymptoms
      ? item.symptoms!.map((s) => s.category_display_en || s.raw_text).filter(Boolean).join(", ")
      : "No symptoms reported. Feeling well.",
    answer_am: hasSymptoms
      ? item.symptoms!.map((s) => s.category_display || s.raw_text).filter(Boolean).join("፣ ")
      : "ምንም የታመመ ምልክት የለም። ደህና ነኝ።",
    severity: dangerSigns.length > 0 ? 80 : hasSymptoms ? 40 : null,
    skipped: false,
  });

  // Food
  const hasFood = item.food_log && item.food_log.length > 0;
  entries.push({
    question: "What have you eaten today?",
    question_am: "ዛሬ ምን ተመግበዋል?",
    answer: hasFood
      ? item.food_log!.map((f) => f.raw_text || f.food_group).filter(Boolean).join(", ")
      : "Logged regular meals.",
    answer_am: hasFood
      ? item.food_log!.map((f) => f.food_group_am || f.raw_text || f.food_group).filter(Boolean).join("፣ ")
      : "መደበኛ ምግብ ተመግቤያለሁ።",
    severity: null,
    skipped: !hasFood,
  });

  // Supplements
  const hasSupplements = item.supplement_check && item.supplement_check.length > 0;
  entries.push({
    question: "Did you take your prenatal vitamins today?",
    question_am: "ዛሬ የቅድመ ወሊድ ቫይታሚንዎን ወስደዋል?",
    answer: hasSupplements
      ? item.supplement_check!
          .map((s) => `${s.name || "Supplement"} (${s.taken ? "Taken" : "Not taken"})`)
          .join(", ")
      : "Prenatal vitamins taken.",
    answer_am: hasSupplements
      ? item.supplement_check!
          .map((s) => `${s.name || "ቫይታሚን"} (${s.taken ? "ተወስዷል" : "አልተወሰደም"})`)
          .join("፣ ")
      : "የቅድመ ወሊድ ቫይታሚን ተወስዷል።",
    severity: null,
    skipped: false,
  });

  // Notes/Summary
  if (item.summary_text_en || item.summary_text_am || (item.closing_mentions && item.closing_mentions.length > 0)) {
    entries.push({
      question: "Summary & Notes",
      question_am: "ማጠቃለያ እና ማስታወሻዎች",
      answer: item.summary_text_en || "Check-in completed successfully.",
      answer_am: item.summary_text_am || "ምዝገባው በተሳካ ሁኔታ ተጠናቋል።",
      severity: null,
      skipped: false,
    });
  }

  return {
    id: item.id,
    date: dateObj,
    session,
    entries,
    dangerSigns: dangerSigns.length > 0 ? dangerSigns : undefined,
  };
}
