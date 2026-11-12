"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  FileText,
  Mic,
  Pause,
  PenLine,
  Phone,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CheckinReportSheet, severityLabel, type CheckinEntry, type CheckinDangerSign } from "../components/CheckinReportSheet";
import Link from "next/link";
import { useTranslation } from "../components/languageStore";
import { useRouter } from "next/navigation";
import { VoiceIris, type OrbMode } from "./VoiceIris";
import { checkinApi, type OfflineCheckInPayload } from "../api/checkin";
import { reportsApi } from "../api/reports";
import { getAccessToken } from "../api/client";
import { useInvalidateQueries } from "../api";
import { backendSummaryToArchiveItem } from "../report/reportCatalog";
import { evaluateSupplementAnswer } from "../report/reportMetrics";
import { backendCheckinToFrontendLog } from "../logs/checkinLogsData";
import { showToast } from "../components/toastStore";

export const DEFAULT_DANGER_SIGN: CheckinDangerSign = {
  name: "Severe headache with blurred vision",
  name_am: "ጽኑ ራስ ምታት ከእይታ ብዥታ ጋር",
  detail: "You described acute danger symptoms requiring immediate clinical evaluation.",
  detail_am: "አስቸኳይ የህክምና ክትትል የሚያስፈልጋቸው የአደጋ ምልክቶች ተመዝግበዋል።",
  severity: "Critical",
};

export const DANGER_SIGN_DEFINITIONS: Record<
  string,
  { name_en: string; name_am: string; detail_en: string; detail_am: string }
> = {
  vaginal_bleeding: {
    name_en: "Vaginal bleeding",
    name_am: "የሴት ብልት ደም መፍሰስ",
    detail_en: "You reported vaginal bleeding or spotting during pregnancy.",
    detail_am: "በእርግዝና ወቅት የደም መፍሰስ ወይም መፍሰስ እንዳለዎት ገልጸዋል።",
  },
  severe_headache: {
    name_en: "Severe headache",
    name_am: "ጽኑ ራስ ምታት",
    detail_en: "You reported a severe headache that has not eased with rest.",
    detail_am: "ከእረፍት በኋላ ያልቀለለ ጽኑ ራስ ምታት እንዳለዎት ገልጸዋል።",
  },
  blurred_vision: {
    name_en: "Blurred vision",
    name_am: "የእይታ ብዥታ",
    detail_en: "You reported blurred vision or visual disturbances.",
    detail_am: "የእይታ ብዥታ ወይም የማየት ችግር እንዳለዎት ገልጸዋል።",
  },
  severe_abdominal_pain: {
    name_en: "Severe abdominal pain",
    name_am: "ከፍተኛ የሆድ ህመም",
    detail_en: "You reported severe or persistent abdominal pain.",
    detail_am: "ከፍተኛ ወይም የማያቋርጥ የሆድ ህመም እንዳለዎት ገልጸዋል።",
  },
  high_fever: {
    name_en: "High fever",
    name_am: "ከፍተኛ ትኩሳት",
    detail_en: "You reported a high body temperature or chills.",
    detail_am: "ከፍተኛ የሰውነት ሙቀት ወይም ብርድ ብርድ የማለት ስሜት እንዳለዎት ገልጸዋል።",
  },
  fluid_leakage: {
    name_en: "Fluid leakage / water breaking",
    name_am: "የፈሳሽ መፍሰስ",
    detail_en: "You reported sudden or continuous leaking of watery fluid.",
    detail_am: "ድንገተኛ ወይም የማያቋርጥ የፈሳሽ መፍሰስ እንዳለዎት ገልጸዋል።",
  },
  swelling_hands_face: {
    name_en: "Severe swelling of hands and face",
    name_am: "የእጅ እና የፊት እብጠት",
    detail_en: "You reported sudden or severe swelling in your hands or face.",
    detail_am: "ድንገተኛ ወይም ከፍተኛ የእጅ እና የፊት እብጠት እንዳለዎት ገልጸዋል።",
  },
  difficulty_breathing: {
    name_en: "Difficulty breathing",
    name_am: "የመተንፈስ ችግር",
    detail_en: "You reported shortness of breath or difficulty breathing.",
    detail_am: "የመተንፈስ መቆራረጥ ወይም የትንፋሽ ማጠር እንዳለዎት ገልጸዋል።",
  },
  abnormal_fetal_movement: {
    name_en: "Decreased baby movement",
    name_am: "የፅንስ እንቅስቃሴ መቀነስ",
    detail_en: "You reported reduced or absent baby movement.",
    detail_am: "የፅንሱ እንቅስቃሴ በከፍተኛ ሁኔታ እንደቀነሰ ወይም እንደቆመ ገልጸዋል።",
  },
  persistent_nausea_vomiting: {
    name_en: "Persistent severe vomiting",
    name_am: "የማያቋርጥ ከባድ ማስታወክ",
    detail_en: "You reported persistent vomiting preventing fluid intake.",
    detail_am: "ምግብም ሆነ ፈሳሽ የማያስወስድ ከፍተኛ ማስታወክ እንዳለዎት ገልጸዋል።",
  },
  convulsions_loss_of_consciousness: {
    name_en: "Convulsions or fainting",
    name_am: "መንቀጥቀጥ ወይም ራስ መሳት",
    detail_en: "You reported experiencing convulsions, fainting, or tremors.",
    detail_am: "የመንቀጥቀጥ ወይም ራስን የመሳት አጋጣሚ እንደነበረ ገልጸዋል።",
  },
  severe_weakness_or_backache: {
    name_en: "Severe weakness or acute backache",
    name_am: "ከፍተኛ ድካም ወይም የወገብ ህመም",
    detail_en: "You reported acute severe weakness or severe backache.",
    detail_am: "ከፍተኛ ድካም ወይም ከፍተኛ የወገብ ህመም እንዳለዎት ገልጸዋል።",
  },
};

export function resolveDangerSign(category?: string | null, rawText?: string | null): CheckinDangerSign {
  const cat = category?.toLowerCase().trim();
  if (cat && DANGER_SIGN_DEFINITIONS[cat]) {
    const def = DANGER_SIGN_DEFINITIONS[cat];
    return {
      name: def.name_en,
      name_am: def.name_am,
      detail: def.detail_en,
      detail_am: def.detail_am,
      severity: "Critical",
    };
  }
  const cleanRaw = (rawText || "").trim();
  return {
    name: cleanRaw ? `Danger sign: ${cleanRaw}` : "A clinical danger sign was detected",
    name_am: cleanRaw ? `የተመዘገበ የአደጋ ምልክት፡ ${cleanRaw}` : "የአደጋ ምልክት ተገኝቷል",
    detail: cleanRaw ? `You reported: "${cleanRaw}". Immediate clinical evaluation is required.` : "Our clinical safety system identified urgent danger symptoms requiring immediate assessment.",
    detail_am: cleanRaw ? `የተገለጸው ምልክት፡ "${cleanRaw}"። አስቸኳይ የህክምና ክትትል ያስፈልጋል።` : "የክሊኒካል ደህንነት ስርዓታችን አስቸኳይ የህክምና ግምገማ የሚያስፈልገው የአደጋ ምልክት ለይቷል።",
    severity: "Critical",
  };
}

export function detectDangerCategoryFromText(text: string): string | null {
  const lower = (text || "").toLowerCase().trim();
  if (!lower) return null;
  if (/^(no|none|nothing|no symptoms|i feel fine|feeling well|all good|ደህና ነኝ|ምንም የለም|ምንም የታመመ ምልክት የለም)$/i.test(lower)) {
    return null;
  }
  if (lower.includes("headache") || lower.includes("ራስ ምታት")) return "severe_headache";
  if (lower.includes("bleed") || lower.includes("ደም")) return "vaginal_bleeding";
  if (lower.includes("vision") || lower.includes("ብዥታ")) return "blurred_vision";
  if (lower.includes("abdominal") || lower.includes("ሆድ")) return "severe_abdominal_pain";
  if (lower.includes("fever") || lower.includes("ትኩሳት")) return "high_fever";
  if (lower.includes("breath") || lower.includes("መተንፈስ")) return "difficulty_breathing";
  if (lower.includes("swelling") || lower.includes("እብጠት")) return "swelling_hands_face";
  if (lower.includes("fluid") || lower.includes("leak") || lower.includes("water broke") || lower.includes("ፈሳሽ")) return "fluid_leakage";
  if (lower.includes("vomit") || lower.includes("nausea") || lower.includes("ማስታወክ") || lower.includes("ማቅለሽለሽ")) return "persistent_nausea_vomiting";
  if (lower.includes("convulsion") || lower.includes("faint") || lower.includes("መንቀጥቀጥ") || lower.includes("ራስ መሳት")) return "convulsions_loss_of_consciousness";
  if (lower.includes("movement") || lower.includes("እንቅስቃሴ")) return "abnormal_fetal_movement";
  if (lower.includes("weakness") || lower.includes("backache") || lower.includes("ድካም") || lower.includes("ወገብ")) return "severe_weakness_or_backache";
  return null;
}

function generateSubmissionUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function parseSupplementCheckList(entries: Response[]) {
  const supEntry =
    entries.find(
      (e) =>
        e.question.toLowerCase().includes("supplement") ||
        e.question.toLowerCase().includes("vitamin") ||
        e.question.toLowerCase().includes("iron") ||
        (e.question_am &&
          (e.question_am.includes("እንክብል") || e.question_am.includes("ቫይታሚን"))),
    ) || entries[2];

  const isSupSkipped = Boolean(!supEntry || supEntry.skipped || !supEntry.answer);
  const supRaw = (!isSupSkipped && supEntry?.answer ? String(supEntry.answer) : "").trim();

  let ifaTaken = false;
  let calciumTaken = false;

  if (!isSupSkipped && supRaw) {
    const evalIFA = evaluateSupplementAnswer(supRaw, "ifa", "Iron & Folic Acid (IFA)");
    const evalCalcium = evaluateSupplementAnswer(supRaw, "calcium", "Calcium Supplement");

    if (evalIFA !== null || evalCalcium !== null) {
      ifaTaken = evalIFA === true;
      calciumTaken = evalCalcium === true;
    } else {
      const isNegative =
        /\bnot\s+taken\b|\bnot\b|\bdidn't\b|\bdid\s+not\b|\bmissed\b|\bforgot\b|\bno\b|\bnone\b|\bnever\b|አልተወሰደም|አልወሰድኩም|አልወሰድኩ|አልወሰደም|ረሳሁ|(?:\s|^)አይ(?:\s|$)/i.test(
          supRaw,
        );
      if (isNegative) {
        ifaTaken = false;
        calciumTaken = false;
      } else {
        const isPositive =
          /(?<!not\s+)(?<!didn't\s+)\b(taken|took|done|yes\b|yeah|yep|sure|already|both|all)\b|(?<!አል)(?:ተወስዷል|ተወስዷ|ወሰድኩ|ወሰድኩት|ወስጃለሁ)|(?:\s|^)አዎ(?:\s|$)/i.test(
            supRaw,
          );
        if (isPositive) {
          ifaTaken = true;
          calciumTaken = true;
        }
      }
    }
  }

  const list = isSupSkipped
    ? [
        {
          raw_text: "Skipped",
          supplement_name: "Iron & Folic Acid (IFA)",
          taken_today: false,
        },
        {
          raw_text: "Skipped",
          supplement_name: "Calcium Supplement",
          taken_today: false,
        },
      ]
    : [
        {
          raw_text: supRaw,
          supplement_name: "Iron & Folic Acid (IFA)",
          taken_today: ifaTaken,
        },
        {
          raw_text: supRaw,
          supplement_name: "Calcium Supplement",
          taken_today: calciumTaken,
        },
      ];

  return { list, ifaTaken, calciumTaken, isSupSkipped };
}

async function persistCheckinToBackend(
  entries: CheckinEntry[],
  dangerDetected: boolean,
  onDangerTriggered?: (sign: CheckinDangerSign) => void,
  alreadyCreatedCheckinId?: string | null,
): Promise<{ danger_sign_triggered: boolean; dangerSign?: CheckinDangerSign }> {
  const token = getAccessToken();
  if (!token) return { danger_sign_triggered: dangerDetected };

  const now = new Date();
  const submissionId = generateSubmissionUUID();

  // Symptoms
  const symptomEntry =
    entries.find(
      (e) =>
        e.question.toLowerCase().includes("feeling") ||
        e.question.toLowerCase().includes("symptom") ||
        (e.question_am && e.question_am.includes("ጤና")),
    ) || entries[0];

  const isNoSymptoms =
    !symptomEntry ||
    Boolean(symptomEntry.skipped) ||
    !symptomEntry.answer ||
    /^(no|none|nothing|no symptoms|i feel fine|feeling well|all good|ደህና ነኝ|ምንም የለም|ምንም የታመመ ምልክት የለም)$/i.test(
      String(symptomEntry.answer).trim(),
    );

  const symptomRaw =
    symptomEntry && !symptomEntry.skipped && symptomEntry.answer
      ? String(symptomEntry.answer)
      : "No symptoms reported. Feeling well.";

  const detectedCategory = isNoSymptoms ? null : detectDangerCategoryFromText(symptomRaw);
  const isDangerNow = Boolean(dangerDetected || detectedCategory);
  const sevScore = symptomEntry?.severity ?? 50;
  const symptomSeverity: "mild" | "moderate" | "severe" | "unspecified" =
    isDangerNow || sevScore > 66 ? "severe" : sevScore > 33 ? "moderate" : "mild";

  const symptomsList = isNoSymptoms
    ? []
    : [
        {
          raw_text: symptomRaw,
          category: detectedCategory,
          severity: symptomSeverity,
        },
      ];

  // Food
  const foodEntry =
    entries.find(
      (e) =>
        e.question.toLowerCase().includes("eaten") ||
        e.question.toLowerCase().includes("food") ||
        (e.question_am && e.question_am.includes("ምግብ")),
    ) || entries[1];

  const foodRaw =
    foodEntry && !foodEntry.skipped && foodEntry.answer
      ? String(foodEntry.answer)
      : "Standard nutritious meals logged.";

  const foodGroups: Array<"grains" | "proteins" | "dairy" | "fruits_and_vegetables"> = [];
  const lowerFood = foodRaw.toLowerCase();
  if (/grain|bread|injera|teff|rice|wheat|ዳቦ|እንጀራ|ሩዝ/.test(lowerFood)) foodGroups.push("grains");
  if (/protein|meat|egg|shiro|misir|lentil|beans|ስጋ|እንቁላል|ሽሮ|ምስር/.test(lowerFood))
    foodGroups.push("proteins");
  if (/dairy|milk|cheese|ayib|yogurt|ወተት|አይብ/.test(lowerFood)) foodGroups.push("dairy");
  if (/fruit|veg|banana|orange|greens|gomen|tomato|ሙዝ|ጎመን|ቲማቲም/.test(lowerFood))
    foodGroups.push("fruits_and_vegetables");
  if (foodGroups.length === 0) foodGroups.push("grains");

  const foodLogList = [
    {
      raw_text: foodRaw,
      food_groups: foodGroups,
      items: [],
    },
  ];

  // Supplements
  const { list: supplementCheckList, ifaTaken, calciumTaken, isSupSkipped } =
    parseSupplementCheckList(entries);

  // Closing
  const closingEntry =
    entries.find(
      (e) =>
        e.question.toLowerCase().includes("concern") ||
        e.question.toLowerCase().includes("question") ||
        (e.question_am && e.question_am.includes("ጥያቄ")),
    ) || entries[3];

  const closingRaw =
    closingEntry && !closingEntry.skipped && closingEntry.answer
      ? String(closingEntry.answer)
      : "Daily check-in completed.";

  const closingList = [
    {
      raw_text: closingRaw,
      topic: "other" as const,
    },
  ];

  const payload: OfflineCheckInPayload = {
    schema_version: 1,
    client_submission_id: submissionId,
    recorded_at: now.toISOString(),
    client_confirmed_at: now.toISOString(),
    confirmed: true,
    symptoms: symptomsList,
    food_log: foodLogList,
    supplement_check: supplementCheckList,
    closing_mentions: closingList,
  };

  let dangerTriggered = isDangerNow;
  let activeDangerSign: CheckinDangerSign | null = detectedCategory ? resolveDangerSign(detectedCategory, symptomRaw) : null;

  try {
    if (!alreadyCreatedCheckinId) {
      const syncRes = await checkinApi.syncOffline(payload);
      if (syncRes?.danger_sign_triggered) {
        dangerTriggered = true;
        if (!activeDangerSign) {
          activeDangerSign = resolveDangerSign(detectedCategory, symptomRaw);
        }
        onDangerTriggered?.(activeDangerSign);
      }
    }

    // Auto-generate summary on backend so ANC report is ready immediately
    // Note: Do NOT inspect the period summary's aggregated danger signs here.
    // The ANC summary aggregates the full 14-day contact period; checking it here would
    // falsely trigger a danger warning on every routine check-in if the user had a danger sign in a past check-in.
    try {
      await reportsApi.generateSummary();
    } catch (sumErr) {
      console.warn("Could not auto-generate report summary:", sumErr);
    }

    return { danger_sign_triggered: dangerTriggered, dangerSign: activeDangerSign || undefined };
  } catch (syncErr: any) {
    console.error("Failed to sync checkin to backend:", syncErr);
    showToast(
      syncErr?.message || "Failed to save check-in to server. Please check your network.",
      "error",
      5000,
    );
    return { danger_sign_triggered: dangerTriggered, dangerSign: activeDangerSign || undefined };
  }
}

type Phase = "asking" | "listening" | "processing" | "review" | "editing" | "confirming";

type Response = CheckinEntry;

/* ------------------------------------------------------------------ */
/* Voice iris aperture (replaces legacy multi-disc orb)               */
/* ------------------------------------------------------------------ */

// VoiceIris component handles the iris aperture animation, themed in warm gold
// and responding dynamically to idle, speaking, listening, and danger states.

/* ------------------------------------------------------------------ */
/* Animated words: the question types itself in, word by word          */
/* ------------------------------------------------------------------ */

function AnimatedWords({
  text,
  className = "",
  wordDelay = 130,
  onDone,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
  onDone?: () => void;
}) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= words.length) {
      onDoneRef.current?.();
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), count === 0 ? 250 : wordDelay);
    return () => window.clearTimeout(id);
  }, [count, words.length, wordDelay]);

  return (
    <p className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`inline-block transition-all duration-300 ${
            i < count ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {word}
          {"\u00A0"}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Processing state: question stays, shimmer lines + bouncing dots     */
/* ------------------------------------------------------------------ */

function ProcessingState({ isAmharic }: { isAmharic?: boolean }) {
  return (
    <div
      className="mt-6 flex w-full flex-col items-center"
      role="status"
      aria-label="Understanding your words"
    >
      <div className="flex w-full max-w-[280px] flex-col gap-2.5">
        <div className="skeleton-line w-11/12" />
        <div className="skeleton-line w-3/4" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13.5px] text-[#85735a] dark:text-[#b9a88e]">
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="proc-dot" style={{ animationDelay: "0ms" }} />
          <span className="proc-dot" style={{ animationDelay: "150ms" }} />
          <span className="proc-dot" style={{ animationDelay: "300ms" }} />
        </span>
        {isAmharic ? "ቃላትዎን በማስተዋል ላይ…" : "Understanding your words…"}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Severity slider                                                     */
/* ------------------------------------------------------------------ */

function SeveritySlider({
  value,
  onChange,
  disabled,
  isAmharic = false,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  isAmharic?: boolean;
}) {
  return (
    <div className="mt-5 w-full">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Severity, currently ${severityLabel(value, isAmharic)}`}
        className="severity-slider"
        style={{ ["--fill" as string]: `${value}%` } as React.CSSProperties}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-[#9b8a6f] dark:text-[#9c8b72]">
        <span>{isAmharic ? "ቀላል" : "Mild"}</span>
        <span>{isAmharic ? "መካከለኛ" : "Moderate"}</span>
        <span>{isAmharic ? "ከፍተኛ" : "Severe"}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review card: the transcribed answer + "is that correct?" + severity */
/* ------------------------------------------------------------------ */

function ReviewCard({
  draft,
  editing,
  onDraftChange,
  severity,
  onSeverityChange,
  showSeverity = true,
  isNoVoice = false,
  locked,
  saved,
  isAmharic,
  answering = false,
  onAnswerDone,
}: {
  draft: string;
  editing: boolean;
  onDraftChange: (v: string) => void;
  severity: number;
  onSeverityChange: (v: number) => void;
  showSeverity?: boolean;
  isNoVoice?: boolean;
  locked: boolean;
  saved: boolean;
  isAmharic?: boolean;
  answering?: boolean;
  onAnswerDone?: () => void;
}) {
  return (
    <div className="review-in mt-6 w-full text-center">
      {editing ? (
        <div>
          <label htmlFor="answer-edit" className="sr-only">
            {isAmharic ? "የተፃፈውን መልስዎን ያስተካክሉ" : "Edit your transcribed answer"}
          </label>
          <textarea
            id="answer-edit"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={3}
            autoFocus
            placeholder={
              isAmharic
                ? "መልስዎን እዚህ ይጻፉ…"
                : "Type your answer here…"
            }
            className="w-full resize-none rounded-2xl border border-[#c9a35d]/60 bg-white px-4 py-3 text-left text-[16px] leading-relaxed text-[#3b3226] outline-none focus:border-[#8d6a2a] dark:border-[#e5be79]/50 dark:bg-[#1c1611] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
          />
          <p className="mt-2 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
            {isAmharic ? "ቃላትን ካስተካከሉ በኋላ አረጋግጥ የሚለውን ይጫኑ።" : "Fix any words, then hit confirm."}
          </p>
        </div>
      ) : (
        <div>
          {isNoVoice ? (
            <div className="rounded-2xl border border-[#b98a3e]/30 bg-[#fdfaf3] p-4 text-center dark:border-[#e5be79]/25 dark:bg-[#1f1913]">
              <p className="text-[16px] font-medium leading-relaxed text-[#8d6a2a] dark:text-[#e5be79]">
                {draft}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#85735a] dark:text-[#c7b69c]">
                {isAmharic
                  ? "መልስዎን ለመመዝገብ ከታች ያለውን ማይክሮፎን ተጭነው ጮክ ብለው ይናገሩ፣ ወይም 'አስተካክል' የሚለውን ተጭነው ይጻፉ።"
                  : "Tap the microphone below and speak loudly, or tap edit to type your answer."}
              </p>
            </div>
          ) : answering ? (
            <AnimatedWords
              text={draft}
              className="text-[17px] font-medium leading-[1.45] text-[#3b3226] dark:text-[#f5ede0]"
              wordDelay={85}
              onDone={onAnswerDone}
            />
          ) : (
            <p className="text-[17px] font-medium leading-[1.45] text-[#3b3226] dark:text-[#f5ede0]">
              {draft}
            </p>
          )}
          <div className="mt-2 flex min-h-6 items-center justify-center">
            {saved ? (
              <span
                className="saved-answer flex items-center gap-2 text-[14px] font-medium text-[#8d6a2a] dark:text-[#e5be79]"
                role="status"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbe7b8] dark:bg-[#e5be79]/22">
                  <Check size={13} strokeWidth={2.4} />
                </span>
                {isAmharic ? "ተቀምጧል" : "Saved"}
              </span>
            ) : !isNoVoice ? (
              <p className="text-[15px] text-[#6f6149] dark:text-[#c7b69c]">
                {isAmharic ? "ትክክል ነው?" : "Is that correct?"}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {showSeverity && !isNoVoice && (
        <SeveritySlider value={severity} onChange={onSeverityChange} disabled={locked} isAmharic={isAmharic} />
      )}

      {!locked && !editing && !isNoVoice && (
        <p className="mt-4 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
          {isAmharic ? "መልስዎን ለመቀየር ማስተካከል ወይም በድጋሚ መቅዳትን ይጫኑ።" : "Tap edit or re-record to change your answer."}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Waveform: small gold bars that move while the app is listening      */
/* ------------------------------------------------------------------ */

function Waveform({ listening }: { listening: boolean }) {
  const bars = [0.5, 0.8, 1, 0.65, 0.9, 0.55, 0.75];
  return (
    <div className="flex h-10 items-center justify-center gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`block w-[3px] rounded-full bg-gradient-to-b from-[#e9bd78] to-[#b98a3e] ${
            listening ? "voice-bar" : ""
          }`}
          style={{
            height: `${h * 36}px`,
            transform: listening ? undefined : "scaleY(0.35)",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type StagePromptItem = {
  stage: string;
  category_am?: string;
  category_en?: string;
  prompt_am: string;
  prompt_en: string;
  audio_url?: string;
};

const DEFAULT_STAGE_PROMPTS: StagePromptItem[] = [
  {
    stage: "symptoms",
    category_am: "የአደጋ ምልክቶች እና ህመም",
    category_en: "DANGER SIGNS & SYMPTOMS",
    prompt_am: "ዛሬ ጽኑ ራስ ምታት፣ የዓይን ብዥታ፣ ደም መፍሰስ፣ ፈሳሽ መፍሰስ ወይም ከፍተኛ የሆድ ህመም ተሰምቶዎታል?",
    prompt_en: "Did you experience any severe headache, blurred vision, vaginal bleeding, fluid leakage, or abdominal pain today?",
    audio_url: "https://lpsjopunbwsmvuzwwqap.supabase.co/storage/v1/object/public/audio-prompts/prompts/5a6af3d803daf99a/symptoms.mp3",
  },
  {
    stage: "food",
    category_am: "የተመጣጠነ ምግብ እና አመጋገብ",
    category_en: "NUTRITION & DIET",
    prompt_am: "ዛሬ ምን ምን አይነት ምግቦችን ተመገቡ? ቢያንስ አንድ ተጨማሪ የተመጣጠነ ምግብ ወስደዋል?",
    prompt_en: "What foods did you eat today? Did you have an additional nutrient-dense meal?",
    audio_url: "https://lpsjopunbwsmvuzwwqap.supabase.co/storage/v1/object/public/audio-prompts/prompts/455ff537974bddd5/food.mp3",
  },
  {
    stage: "supplement",
    category_am: "የቅድመ ወሊድ እንክብሎች",
    category_en: "PRENATAL SUPPLEMENTS",
    prompt_am: "የዛሬውን የብረት እና ፎሊክ አሲድ (IFA) ወይም የካልሲየም እንክብል ወስደዋል?",
    prompt_en: "Did you take your prescribed daily Iron-Folic Acid (IFA) or Calcium supplement today?",
    audio_url: "https://lpsjopunbwsmvuzwwqap.supabase.co/storage/v1/object/public/audio-prompts/prompts/703f577909f220dd/supplement.mp3",
  },
  {
    stage: "closing",
    category_am: "አጠቃላይ ስሜት እና ጥያቄዎች",
    category_en: "CLOSING & QUESTIONS",
    prompt_am: "ሌላ የሚያስጨንቅዎት ማንኛውም የጤና ለውጥ፣ ህመም ወይም ጥያቄ አለዎት?",
    prompt_en: "Do you have any other questions, concerns, or symptoms you would like to report?",
    audio_url: "https://lpsjopunbwsmvuzwwqap.supabase.co/storage/v1/object/public/audio-prompts/prompts/bea94813e9fc82ed/closing.mp3",
  },
];

const STATUS: Record<Phase | "done", string> = {
  asking: "Tap record to begin",
  listening: "Listening...",
  processing: "Understanding...",
  review: "Review your answer",
  editing: "Editing",
  confirming: "Saving...",
  done: "Complete",
};

export function VoiceCheckin() {
  const router = useRouter();
  const { t, isAmharic } = useTranslation();
  const { invalidateCheckinHistory, invalidateReports, invalidateUser } = useInvalidateQueries();
  const [stagePrompts, setStagePrompts] = useState<StagePromptItem[]>(DEFAULT_STAGE_PROMPTS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");
  const [draft, setDraft] = useState("");
  const [isNoVoice, setIsNoVoice] = useState(false);
  const [severity, setSeverity] = useState(50);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showReport, setShowReport] = useState(false);
  /** Real clinical danger sign triggered by backend extraction or clinical rules. */
  const [dangerDetected, setDangerDetected] = useState(false);
  const [detectedDanger, setDetectedDanger] = useState<CheckinDangerSign | null>(null);
  /** True while the question text is animating in — i.e. the AI is speaking. */
  const [speaking, setSpeaking] = useState(true);
  /** True while the answer is processing or the transcribed answer text is typing in. */
  const [answering, setAnswering] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<Array<Record<string, unknown>>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActionInProgressRef = useRef(false);
  const hasPersistedRef = useRef(false);
  const responsesRef = useRef<Response[]>([]);
  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);
  const versionRef = useRef(0);
  const timers = useRef<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const promptAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTranscriptRef = useRef<string>("");

  const isDanger = dangerDetected;
  const completed = isDanger || questionIndex >= stagePrompts.length;
  const listening = phase === "listening";
  const currentStageItem = !completed ? stagePrompts[questionIndex] : null;
  const question = currentStageItem
    ? {
        prompt: isAmharic ? currentStageItem.prompt_am : currentStageItem.prompt_en,
      }
    : null;

  // A new question means the AI starts speaking it again.
  useEffect(() => {
    setSpeaking(true);
    setAnswering(false);

    if (completed || !currentStageItem?.audio_url || muted) {
      if (promptAudioRef.current) {
        promptAudioRef.current.pause();
      }
      return;
    }

    try {
      if (promptAudioRef.current) {
        promptAudioRef.current.pause();
      }
      const audio = new Audio(currentStageItem.audio_url);
      promptAudioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      audio.play().catch(() => {
        setSpeaking(false);
      });
    } catch {
      setSpeaking(false);
    }

    return () => {
      if (promptAudioRef.current) {
        promptAudioRef.current.pause();
      }
    };
  }, [questionIndex, muted, completed, currentStageItem]);

  const orbMode: OrbMode =
    completed && isDanger
      ? "danger"
      : listening
        ? "listening"
        : speaking && !completed && !leaving
          ? "speaking"
          : "idle";

  /**
   * The iris animation only runs when:
   * 1. The question text is animating on screen (AI speaking)
   * 2. In the "listening" state (user recording)
   * 3. When it answers (processing speech & typing out the answer)
   * Otherwise, the iris rests still at its graceful geometric aperture.
   */
  const isAnimating =
    !completed &&
    !leaving &&
    ((speaking && phase === "asking") || listening || phase === "processing" || answering);

  useEffect(() => {
    router.prefetch("/home");
    let mounted = true;

    // Fetch official check-in prompts from backend:
    checkinApi
      .getPrompts()
      .then((prompts) => {
        if (!mounted || !prompts || prompts.length === 0) return;
        setStagePrompts(
          prompts.map((p) => ({
            stage: p.stage,
            category_am: p.category_am,
            category_en: p.category_en,
            prompt_am: p.prompt_am,
            prompt_en: p.prompt_en,
            audio_url: p.audio_url,
          }))
        );
      })
      .catch((err) => {
        console.warn("Using offline prompts:", err);
      });

    // Initialize backend check-in session if authenticated:
    if (getAccessToken()) {
      checkinApi
        .startSession()
        .then((session) => {
          if (!mounted) return;
          setSessionId(session.session_id);
          versionRef.current = session.version;
          if (Array.isArray(session.stage_order) && session.stage_order.length > 0) {
            setStagePrompts((current) => {
              const orderMap = new Map(session.stage_order!.map((st, idx) => [st, idx]));
              const filtered = current.filter((p) => orderMap.has(p.stage));
              if (filtered.length > 0) {
                return filtered.sort((a, b) => (orderMap.get(a.stage) ?? 0) - (orderMap.get(b.stage) ?? 0));
              }
              return current;
            });
          }
        })
        .catch((err) => {
          console.warn("Could not start live backend checkin session:", err);
        });
    }

    return () => {
      mounted = false;
      timers.current.forEach((id) => window.clearTimeout(id));
      if (promptAudioRef.current) {
        promptAudioRef.current.pause();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [router]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const goHome = () => {
    invalidateCheckinHistory();
    invalidateReports();
    invalidateUser();
    router.push("/home");
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (next && promptAudioRef.current) {
        promptAudioRef.current.pause();
      }
      return next;
    });
  };

  /** Start capturing an answer for the current question. */
  const startListening = async () => {
    if (completed || leaving || phase === "confirming" || phase === "processing") return;
    clearTimers();
    setAnswering(false);
    setIsNoVoice(false);
    speechTranscriptRef.current = "";

    if (promptAudioRef.current) {
      promptAudioRef.current.pause();
      setSpeaking(false);
    }

    // Client-side Web Speech recognition fallback
    try {
      if (typeof window !== "undefined") {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch {}
          }
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = isAmharic ? "am-ET" : "en-US";
          rec.onresult = (event: any) => {
            let str = "";
            for (let i = 0; i < event.results.length; i++) {
              str += event.results[i][0].transcript;
            }
            speechTranscriptRef.current = str;
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        }
      }
    } catch (err) {
      console.warn("SpeechRecognition not initialized:", err);
    }

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const mimeType =
          typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4";
        const recorder = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      }
    } catch (err) {
      console.warn("Microphone not available or permission denied:", err);
    }

    setPhase("listening");
  };

  /** Stop capturing → brief processing → transcribed review card. */
  const stopListening = () => {
    if (phase !== "listening" || completed) return;
    setPhase("processing");
    setAnswering(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const noVoiceMessage = isAmharic
      ? "ድምጽዎን በደንብ አልሰማሁም፤ እባክዎን ወደ ማይክሮፎንዎ ቀረብ ብለው ጮክ ብለው ይናገሩ።"
      : "Didn't quite catch that. Speak loudly to your microphone.";

    const handleTranscriptionResult = (transcript: string) => {
      const clean = transcript ? transcript.trim() : "";
      if (clean.length > 0) {
        setDraft(clean);
        setIsNoVoice(false);
      } else {
        setDraft(noVoiceMessage);
        setIsNoVoice(true);
      }
      setSeverity(50);
      setPhase("review");
    };

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

        audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        mediaRecorderRef.current = null;

        if (sessionId && blob.size > 0) {
          try {
            const resp = await checkinApi.respond(sessionId, blob, versionRef.current);
            versionRef.current = resp.version;
            setPendingItems(resp.pending_items || []);
            const hasDangerInPending = (resp.pending_items as any[])?.some(
              (it) => it.danger_sign === true || it.danger_sign_triggered === true || (it.category && it.category in DANGER_SIGN_DEFINITIONS)
            );
            if (resp.danger_sign_triggered || (resp as any).danger_sign || hasDangerInPending) {
              const dItem = (resp.pending_items as any[])?.find(
                (it) => it.danger_sign === true || it.danger_sign_triggered === true || (it.category && it.category in DANGER_SIGN_DEFINITIONS)
              );
              const sign = resolveDangerSign(dItem?.category, dItem?.raw_text || resp.transcript);
              setDangerDetected(true);
              setDetectedDanger(sign);

              const currentPromptEn = currentStageItem?.prompt_en ?? question?.prompt ?? "";
              const currentPromptAm = currentStageItem?.prompt_am ?? "";
              const dangerTranscript = resp.transcript || speechTranscriptRef.current || dItem?.raw_text || "Acute danger sign reported";
              const newEntry: Response = {
                question: currentPromptEn,
                question_am: currentPromptAm,
                answer: dangerTranscript,
                answer_am: dangerTranscript,
                severity: 100,
                skipped: false,
              };
              const prev = responsesRef.current;
              const filtered = prev.filter(
                (item) =>
                  item.question !== currentPromptEn &&
                  item.question !== currentPromptAm &&
                  (!currentPromptAm || item.question_am !== currentPromptAm)
              );
              const finalEntries = [...filtered, newEntry];
              responsesRef.current = finalEntries;
              setResponses(finalEntries);

              if (!hasPersistedRef.current) {
                hasPersistedRef.current = true;
                persistCheckinToBackend(
                  finalEntries,
                  true,
                  (s) => {
                    setDangerDetected(true);
                    setDetectedDanger(s);
                  },
                  null,
                );
              }

              if (promptAudioRef.current) {
                promptAudioRef.current.pause();
              }
              setSpeaking(false);
              setIsSubmitting(false);
              isActionInProgressRef.current = false;
              return;
            }
            const finalTranscript = resp.transcript || speechTranscriptRef.current;
            handleTranscriptionResult(finalTranscript || "");
            return;
          } catch (err) {
            console.warn("Backend ASR respond failed, checking speech recognition fallback:", err);
          }
        }

        later(() => {
          handleTranscriptionResult(speechTranscriptRef.current || "");
        }, 1200);
      };

      recorder.stop();
    } else {
      later(() => {
        handleTranscriptionResult(speechTranscriptRef.current || "");
      }, 1200);
    }
  };

  /** Skip stays inside the check-in: swipe to the next question. */
  const skipQuestion = async () => {
    if (completed || leaving || phase === "confirming" || isActionInProgressRef.current) return;
    isActionInProgressRef.current = true;
    setIsSubmitting(true);
    clearTimers();
    setAnswering(false);
    setIsNoVoice(false);

    const currentPromptEn = currentStageItem?.prompt_en ?? question?.prompt ?? "";
    const currentPromptAm = currentStageItem?.prompt_am ?? "";
    const newEntry: Response = {
      question: currentPromptEn,
      question_am: currentPromptAm,
      answer: null,
      answer_am: null,
      severity: null,
      skipped: true,
    };

    const prev = responsesRef.current;
    const filtered = prev.filter(
      (item) =>
        item.question !== currentPromptEn &&
        item.question !== currentPromptAm &&
        (!currentPromptAm || item.question_am !== currentPromptAm)
    );
    const finalEntries = [...filtered, newEntry];
    responsesRef.current = finalEntries;
    setResponses(finalEntries);

    let triggeredDangerSign: CheckinDangerSign | null = null;
    let backendCreatedId: string | null = null;
    if (sessionId) {
      try {
        const resp = await checkinApi.completeStage(sessionId, true, versionRef.current);
        versionRef.current = resp.version;
        if (resp.danger_sign_triggered || (resp as any).danger_sign) {
          triggeredDangerSign = resolveDangerSign(null, "Danger sign recorded");
          setDangerDetected(true);
          setDetectedDanger(triggeredDangerSign);
        }
        if (resp.session_completed && resp.check_in_id) {
          backendCreatedId = resp.check_in_id;
        }
      } catch (err) {
        console.warn("Failed to skip stage on backend:", err);
      }
    }

    const isNowDanger = Boolean(dangerDetected || triggeredDangerSign);

    if (isNowDanger || questionIndex + 1 >= stagePrompts.length) {
      if (!hasPersistedRef.current) {
        hasPersistedRef.current = true;
        persistCheckinToBackend(
          finalEntries,
          isNowDanger,
          (sign) => {
            setDangerDetected(true);
            setDetectedDanger(sign);
          },
          backendCreatedId,
        );
      }

      if (isNowDanger) {
        if (promptAudioRef.current) {
          promptAudioRef.current.pause();
        }
        setSpeaking(false);
        setIsSubmitting(false);
        isActionInProgressRef.current = false;
        return;
      }
    }

    setLeaving(true);
    later(() => {
      setQuestionIndex((i) => i + 1);
      setDraft("");
      setIsNoVoice(false);
      setSeverity(50);
      setPendingItems([]);
      setPhase("asking");
      setLeaving(false);
      setIsSubmitting(false);
      isActionInProgressRef.current = false;
    }, 320);
  };

  /** Confirm shows a saved state, then swipes to the next question. */
  const confirmAnswer = async () => {
    if ((phase !== "review" && phase !== "editing") || isActionInProgressRef.current || leaving) return;
    isActionInProgressRef.current = true;
    setIsSubmitting(true);
    setAnswering(false);
    const validAnswer = isNoVoice ? null : (draft.trim() || null);
    const finalSeverity = questionIndex === 0 && !isNoVoice && validAnswer ? severity : null;

    const currentPromptEn = currentStageItem?.prompt_en ?? question?.prompt ?? "";
    const currentPromptAm = currentStageItem?.prompt_am ?? "";
    const newEntry: Response = {
      question: currentPromptEn,
      question_am: currentPromptAm,
      answer: validAnswer,
      answer_am: validAnswer,
      severity: finalSeverity,
      skipped: isNoVoice,
    };

    const prev = responsesRef.current;
    const filtered = prev.filter(
      (item) =>
        item.question !== currentPromptEn &&
        item.question !== currentPromptAm &&
        (!currentPromptAm || item.question_am !== currentPromptAm)
    );
    const finalEntries = [...filtered, newEntry];
    responsesRef.current = finalEntries;
    setResponses(finalEntries);
    setPhase("confirming");

    let triggeredDangerSign: CheckinDangerSign | null = null;
    let backendCreatedId: string | null = null;

    if (sessionId) {
      try {
        if (!isNoVoice) {
          let verifyOps: any[] = [];
          if (pendingItems.length > 0) {
            const firstItemRaw = String(pendingItems[0]?.raw_text || "").trim();
            const isEdited = Boolean(validAnswer && validAnswer !== firstItemRaw);
            verifyOps = pendingItems.map((item, idx) => ({
              action: "verify",
              item_id: (item.item_id as string) || null,
              confirmed: true,
              ...(idx === 0 && isEdited ? { corrected_value: { raw_text: validAnswer } } : {}),
            }));
          } else if (validAnswer) {
            verifyOps = [{
              action: "add",
              confirmed: true,
              corrected_value: { raw_text: validAnswer },
            }];
          }

          if (verifyOps.length > 0) {
            const verifyResp = await checkinApi.verify(
              sessionId,
              verifyOps,
              versionRef.current
            );
            versionRef.current = verifyResp.version;
            if (verifyResp.danger_sign_triggered || (verifyResp as any).danger_sign) {
              triggeredDangerSign = resolveDangerSign(pendingItems[0]?.category as string, (pendingItems[0]?.raw_text as string) || draft);
              setDangerDetected(true);
              setDetectedDanger(triggeredDangerSign);
            }
          }
        }

        const completeResp = await checkinApi.completeStage(sessionId, isNoVoice, versionRef.current);
        versionRef.current = completeResp.version;
        if (completeResp.danger_sign_triggered || (completeResp as any).danger_sign) {
          triggeredDangerSign = triggeredDangerSign || resolveDangerSign(null, draft);
          setDangerDetected(true);
          setDetectedDanger(triggeredDangerSign);
        }
        if (completeResp.session_completed && completeResp.check_in_id) {
          backendCreatedId = completeResp.check_in_id;
        }
      } catch (err) {
        console.warn("Failed to complete stage on backend:", err);
      }
    }

    const localDangerCat = detectDangerCategoryFromText(validAnswer || "");
    if (localDangerCat) {
      triggeredDangerSign = triggeredDangerSign || resolveDangerSign(localDangerCat, validAnswer);
      setDangerDetected(true);
      setDetectedDanger(triggeredDangerSign);
    }

    const isNowDanger = Boolean(dangerDetected || triggeredDangerSign);

    if (isNowDanger || questionIndex + 1 >= stagePrompts.length) {
      if (!hasPersistedRef.current) {
        hasPersistedRef.current = true;
        persistCheckinToBackend(
          finalEntries,
          isNowDanger,
          (sign) => {
            setDangerDetected(true);
            setDetectedDanger(sign);
          },
          backendCreatedId,
        );
      }

      if (isNowDanger) {
        if (promptAudioRef.current) {
          promptAudioRef.current.pause();
        }
        setSpeaking(false);
        setIsSubmitting(false);
        isActionInProgressRef.current = false;
        return;
      }
    }

    later(() => setLeaving(true), 750);
    later(() => {
      setQuestionIndex((i) => i + 1);
      setDraft("");
      setIsNoVoice(false);
      setSeverity(50);
      setPendingItems([]);
      setLeaving(false);
      setPhase("asking");
      setIsSubmitting(false);
      isActionInProgressRef.current = false;
    }, 1080);
  };

  const toggleEdit = () => {
    setAnswering(false);
    if (phase === "review") {
      if (isNoVoice) {
        setDraft("");
        setIsNoVoice(false);
      }
      setPhase("editing");
    } else if (phase === "editing") {
      setPhase("review");
    }
  };

  /** Discard the transcription and listen again for the same question. */
  const reRecord = () => {
    if (phase !== "review") return;
    clearTimers();
    setAnswering(false);
    setDraft("");
    setIsNoVoice(false);
    startListening();
  };

  const recordDisabled =
    completed || leaving || phase === "processing" || phase === "editing" || phase === "confirming";
  const inReview = phase === "review" || phase === "editing";
  const editDisabled = completed || leaving || !inReview;
  const rightIsConfirm = inReview || phase === "confirming";

  return (
    <div
      className={`relative flex min-h-[100dvh] w-full justify-center overflow-hidden text-[#3b3226] dark:text-[#f5ede0] ${
        completed && isDanger
          ? "bg-gradient-to-b from-[#f6ece5] to-[#f4e4dc] dark:from-[#1e120f] dark:to-[#150f0d]"
          : "bg-[#f5efe3] dark:bg-[#15120e]"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {completed && isDanger ? (
          <>
            <div className="absolute left-1/2 top-[8%] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#d97762] opacity-12 blur-[120px] dark:opacity-18" />
            <div className="absolute -right-24 top-[40%] h-[300px] w-[300px] rounded-full bg-[#c65a45] opacity-8 blur-[120px] dark:opacity-14" />
            <div className="absolute bottom-[-80px] left-[20%] h-[280px] w-[280px] rounded-full bg-white opacity-60 blur-[100px] dark:bg-[#8f3021] dark:opacity-14" />
          </>
        ) : (
          <>
            <div className="absolute -left-24 top-[8%] h-[340px] w-[340px] rounded-full bg-[#f7dfb3] opacity-60 blur-[100px] dark:bg-[#c99642] dark:opacity-14" />
            <div className="absolute -right-24 top-[42%] h-[320px] w-[320px] rounded-full bg-[#e9bd78] opacity-30 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
            <div className="absolute bottom-[-80px] left-[20%] h-[280px] w-[280px] rounded-full bg-white opacity-80 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
          </>
        )}
      </div>

      <div className="relative flex min-h-[100dvh] w-full max-w-[440px] flex-col px-6 pb-8 pt-6">
        <header className="flex items-center justify-between">
          <Link
            href="/home"
            prefetch={true}
            aria-label="Back to home"
            className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={1.8} />
          </Link>

          <div className="text-center">
            <p className="text-[16px] font-medium tracking-tight">{t("voice.title")}</p>
            <p className="mt-0.5 text-[13px] text-[#85735a] dark:text-[#9c8b72]" aria-live="polite">
              {completed ? (isDanger ? (isAmharic ? "አስቸኳይ ትኩረት" : "Urgent attention") : (isAmharic ? "ተጠናቋል" : STATUS.done)) : (isAmharic ? {
                asking: "ለመጀመር ይጫኑ",
                listening: "እያዳመጥኩ ነው…",
                processing: "በማዘጋጀት ላይ…",
                review: "መልስዎን ያረጋግጡ",
                editing: "በማስተካከል ላይ…",
                confirming: "በማስቀመጥ ላይ…",
              }[phase] : STATUS[phase])}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
            className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
          >
            {muted ? (
              <VolumeX size={20} strokeWidth={1.8} />
            ) : (
              <Volume2 size={20} strokeWidth={1.8} />
            )}
          </button>
        </header>

        {!completed && question && (
          <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
            {stagePrompts.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < questionIndex
                    ? "w-5 bg-[#c9a35d]"
                    : i === questionIndex
                      ? "w-8 bg-[#3b3226] dark:bg-[#e5be79]"
                      : "w-1.5 bg-[#d9c9a8] dark:bg-[#3d3123]"
                }`}
              />
            ))}
          </div>
        )}

        <main className="relative flex flex-1 flex-col items-center">
          {/* In the danger state the orb is hidden — the warning icon sits in its place, with the heading above it. */}
          {!(completed && isDanger) && (
            <div className="mt-4 flex w-full items-center justify-center">
              <VoiceIris mode={orbMode} animating={isAnimating} />
            </div>
          )}

          <div className="mt-2 w-full flex-1">
            {completed ? (
              isDanger ? (
                <div className="danger-alert-in w-full text-center">
                  <h2
                    id="danger-headline"
                    className="text-[25px] font-bold leading-[1.2] tracking-[-0.02em] text-[#63281d] dark:text-[#fde8e1]"
                  >
                    {isAmharic ? "የአደጋ ምልክት ተገኝቷል" : "A danger sign was detected"}
                  </h2>
                  <div className="mt-7 flex justify-center" aria-hidden="true">
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <span className="absolute inset-3 rounded-full bg-[#d97762]/14 blur-2xl dark:bg-[#e07a64]/20" />
                      <span className="relative flex h-[74px] w-[74px] items-center justify-center">
                        <span className="danger-ring" />
                        <span className="danger-calm-breathe relative flex h-full w-full items-center justify-center rounded-full border border-[#c65a45]/30 bg-white/80 text-[#b54834] shadow-[0_10px_28px_-14px_rgba(181,72,52,0.3)] backdrop-blur-md dark:border-[#e4725c]/35 dark:bg-[#2c1713]/85 dark:text-[#f08b75] dark:shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)]">
                          <AlertTriangle size={29} strokeWidth={1.75} />
                        </span>
                      </span>
                    </div>
                  </div>
                  <p className="mx-auto mt-6 max-w-[40ch] text-[17px] font-semibold leading-snug text-[#63281d] dark:text-[#fde8e1]">
                    {isAmharic
                      ? (detectedDanger?.name_am || "የተገኘ የአደጋ ምልክት")
                      : (detectedDanger?.name || "A clinical danger sign was detected")}
                  </p>
                  <p className="mx-auto mt-2 max-w-[40ch] text-[15px] leading-relaxed text-[#7d2b1c] dark:text-[#f3bdb0]">
                    {isAmharic
                      ? (detectedDanger?.detail_am || "አስቸኳይ የህክምና ግምገማ የሚያስፈልገው ምልክት ተመዝግቧል።")
                      : (detectedDanger?.detail || "You described acute symptoms that require immediate clinical attention.")}
                  </p>
                  <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-semibold leading-relaxed text-[#63281d] dark:text-[#fde8e1]">
                    {isAmharic
                      ? "እባክዎን አሁንኑ ዶክተርዎን ወይም አዋላጅዎን ያነጋግሩ — እስከ ቀጣዩ ቀጠሮ አይጠብቁ።"
                      : "Please contact your doctor or midwife now — don't wait for your next appointment."}
                  </p>
                  <ul className="mx-auto mt-4 max-w-[42ch] space-y-1.5 text-left text-[14px] leading-relaxed text-[#8d3d2b] dark:text-[#eab0a2]">
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      {isAmharic
                        ? "በጣም ከታመሙ፣ የማየት ችግር ካጋጠመዎ ወይም ህመም ከተሰማዎት አፋጣኝ ህክምና ያግኙ።"
                        : "If you feel very unwell, have trouble seeing, or are in pain, seek urgent care."}
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      {isAmharic
                        ? "ከጤና ባለሙያ ጋር እስኪነጋገሩ ድረስ አንድ ሰው ከእርስዎ ጋር እንዲቆይ ያድርጉ።"
                        : "Ask someone to stay with you until you have spoken to a clinician."}
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      {isAmharic
                        ? "መልሶችዎ ተቀምጠዋል፣ ለህክምና ቡድንዎ ለማጋራት ዝግጁ ናቸው።"
                        : "Your answers are saved and ready to share with your care team."}
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="rise w-full text-center" role="status">
                  <p className="text-[18px] leading-snug text-[#85735a] dark:text-[#b9a88e]">
                    {isAmharic ? "የዛሬው ምዝገባ ተጠናቋል።" : "All done for today."}
                  </p>
                  <p className="mt-3 text-[25px] font-bold leading-[1.2] tracking-[-0.02em]">
                    {isAmharic ? "የዛሬዎቹን ጥያቄዎች ጨርሰዋል።" : "You've reached the end of today's questions."}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
                    {isAmharic ? "ዝግጁ ሲሆኑ ወደ መነሻ ገጽ መመለስ ይችላሉ።" : "Return home whenever you're ready."}
                  </p>
                </div>
              )
            ) : (
              question && (
                <div key={questionIndex} className={leaving ? "q-leaving w-full" : "q-in w-full"}>
                  <AnimatedWords
                    text={question.prompt}
                    className="text-center text-[27px] font-bold leading-[1.25] tracking-[-0.02em] text-[#3b3226] dark:text-[#f5ede0]"
                    onDone={() => setSpeaking(false)}
                  />

                  {phase === "asking" && (
                    <p className="rise mt-4 text-center text-[14px] text-[#85735a] dark:text-[#9c8b72]">
                      {isAmharic ? "የመቅጃ ቁልፉን ተጭነው መልስዎን ይናገሩ።" : "Tap record and speak your answer."}
                    </p>
                  )}
                  {phase === "listening" && (
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-[14px] font-medium text-[#8d6a2a] dark:text-[#e5be79]">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d9ab5e] opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c9a35d]" />
                      </span>
                      {isAmharic ? "እያዳመጥኩ ነው… አሁን ይናገሩ።" : "Listening… speak now."}
                    </p>
                  )}

                  {phase === "processing" && <ProcessingState isAmharic={isAmharic} />}

                  {(phase === "review" || phase === "editing" || phase === "confirming") && (
                    <ReviewCard
                      draft={draft}
                      editing={phase === "editing"}
                      onDraftChange={setDraft}
                      severity={severity}
                      onSeverityChange={setSeverity}
                      showSeverity={questionIndex === 0}
                      isNoVoice={isNoVoice}
                      locked={phase === "confirming"}
                      saved={phase === "confirming"}
                      isAmharic={isAmharic}
                      answering={answering}
                      onAnswerDone={() => setAnswering(false)}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* The waveform is useful while recording, but is hidden during
              processing and verification to keep those states uncluttered. */}
          {phase === "listening" && (
            <div className="mt-4 w-full">
              <Waveform listening />
            </div>
          )}
        </main>

        <footer className="mt-6 flex items-end justify-between">
          {completed ? (
            isDanger ? (
              <div className="flex w-full flex-col gap-2.5">
                <a
                  href="tel:907"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8f3021] px-6 py-3.5 text-[15px] font-semibold text-[#fff7f2] transition-colors hover:bg-[#7a291c] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f3021] dark:bg-[#c65a45] dark:hover:bg-[#d46853]"
                >
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                  {isAmharic ? "ወደ 907 ቀይ መስቀል አምቡላንስ ይደውሉ" : "Call 907 Red Cross Ambulance"}
                </a>
                <div className="mt-1 flex items-center justify-center gap-4 text-[13px]">
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="rounded-full px-3 py-2 font-medium text-[#7d2b1c] underline decoration-[#c65a45]/60 underline-offset-4 transition-colors hover:text-[#4a2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f3021] dark:text-[#f5bfb3] dark:hover:text-[#fde8e1]"
                  >
                    {isAmharic ? "ሪፖርት ይመልከቱ" : "View report"}
                  </button>
                  <span aria-hidden="true" className="text-[#c65a45]/50">
                    /
                  </span>
                  <Link
                    href="/home"
                    prefetch={true}
                    className="rounded-full px-3 py-2 font-medium text-[#6f6149] underline decoration-[#b98a3e]/50 underline-offset-4 transition-colors hover:text-[#3b3226] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#c7b69c] dark:hover:text-[#f5ede0]"
                  >
                    {isAmharic ? "ወደ መነሻ ተመለስ" : "Back to home"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowReport(true)}
                  className="home-card-solid flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-[#4a3f30] dark:text-[#f5ede0] transition hover:border-[#c9a35d]/80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
                >
                  <FileText size={18} strokeWidth={1.8} />
                  {isAmharic ? "ሪፖርት ይመልከቱ" : "View report"}
                </button>
                <Link
                  href="/home"
                  prefetch={true}
                  className="flex w-full items-center justify-center rounded-full bg-[#3b3226] px-6 py-4 text-[15px] font-medium text-[#fbe7b8] transition hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
                >
                  {isAmharic ? "ወደ መነሻ ተመለስ" : "Back to home"}
                </Link>
              </div>
            )
          ) : (
            <>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={phase === "editing" ? (isAmharic ? "ማስተካከል ጨርስ" : "Done editing") : (isAmharic ? "መልስ አስተካክል" : "Edit answer")}
                  aria-pressed={phase === "editing"}
                  onClick={toggleEdit}
                  disabled={editDisabled}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    phase === "editing"
                      ? "border border-[#c9a35d] bg-[#fbe7b8] text-[#4a3f30] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                      : "home-icon-solid text-[#4a3f30] dark:text-[#f0e4ce] hover:border-[#c9a35d]/70"
                  }`}
                >
                  <PenLine size={18} strokeWidth={1.8} />
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  {isAmharic ? "አስተካክል" : "edit"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={
                    phase === "listening"
                      ? (isAmharic ? "መቅዳት አቁም" : "Stop recording")
                      : phase === "review"
                        ? (isAmharic ? "እንደገና ቅዳ" : "Record again")
                        : phase === "processing"
                          ? (isAmharic ? "በማዘጋጀት ላይ" : "Processing answer")
                          : (isAmharic ? "መቅዳት ጀምር" : "Start recording")
                  }
                  aria-pressed={listening}
                  onClick={() => {
                    if (phase === "listening") stopListening();
                    else if (phase === "review") reRecord();
                    else startListening();
                  }}
                  disabled={recordDisabled}
                  className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] shadow-[0_18px_34px_-14px_rgba(60,45,25,0.65)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_18px_36px_-12px_rgba(229,190,121,0.42)]"
                >
                  {listening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#d9ab5e]/30" />
                  )}
                  {phase === "listening" ? (
                    <Pause size={28} strokeWidth={1.9} className="relative" fill="currentColor" />
                  ) : (
                    <Mic size={28} strokeWidth={1.9} className="relative" />
                  )}
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  {isAmharic
                    ? (phase === "listening" ? "አቁም" : phase === "processing" ? "በማዘጋጀት ላይ" : phase === "review" ? "እንደገና" : "ቅዳ")
                    : (phase === "listening" ? "pause" : phase === "processing" ? "working" : phase === "review" ? "redo" : "record")}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={rightIsConfirm ? (isAmharic ? "መልስ አረጋግጥ" : "Confirm answer") : (isAmharic ? "ጥያቄ ዝለል" : "Skip question")}
                  onClick={rightIsConfirm ? confirmAnswer : skipQuestion}
                  disabled={phase === "confirming" || leaving || isSubmitting}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-[#4a3f30] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    rightIsConfirm
                      ? "border border-[#c9a35d] bg-[#fbe7b8] hover:bg-[#f6dcaa] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
                      : "home-icon-solid dark:text-[#f0e4ce] hover:border-[#c9a35d]/70"
                  }`}
                >
                  {rightIsConfirm ? (
                    <Check size={21} strokeWidth={2.2} />
                  ) : (
                    <X size={20} strokeWidth={1.8} />
                  )}
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  {isAmharic ? (rightIsConfirm ? "አረጋግጥ" : "ዝለል") : (rightIsConfirm ? "confirm" : "skip")}
                </span>
              </div>
            </>
          )}
        </footer>
      </div>

      <CheckinReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        eyebrow={t("home.today")}
        title={isAmharic ? "የምዝገባ ሪፖርት" : "Check-in report"}
        entries={responses}
        dangerSigns={isDanger ? (detectedDanger ? [detectedDanger] : [DEFAULT_DANGER_SIGN]) : []}
      />
    </div>
  );
}
