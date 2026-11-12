/**
 * Exact clinical check-in questions delivered by backend check-in sessions
 * (app/core/constants.py - CHECKIN_STAGE_METADATA).
 */
export const CHECKIN_STAGE_PROMPTS = {
  symptoms: {
    category_am: "የአደጋ ምልክቶች እና ህመም",
    category_en: "DANGER SIGNS & SYMPTOMS",
    prompt_am: "ዛሬ ጽኑ ራስ ምታት፣ የዓይን ብዥታ፣ ደም መፍሰስ፣ ፈሳሽ መፍሰስ ወይም ከፍተኛ የሆድ ህመም ተሰምቶዎታል?",
    prompt_en: "Did you experience any severe headache, blurred vision, vaginal bleeding, fluid leakage, or abdominal pain today?",
  },
  food: {
    category_am: "የተመጣጠነ ምግብ እና አመጋገብ",
    category_en: "NUTRITION & DIET",
    prompt_am: "ዛሬ ምን ምን አይነት ምግቦችን ተመገቡ? ቢያንስ አንድ ተጨማሪ የተመጣጠነ ምግብ ወስደዋል?",
    prompt_en: "What foods did you eat today? Did you have an additional nutrient-dense meal?",
  },
  supplement: {
    category_am: "የቅድመ ወሊድ እንክብሎች",
    category_en: "PRENATAL SUPPLEMENTS",
    prompt_am: "የዛሬውን የብረት እና ፎሊክ አሲድ (IFA) ወይም የካልሲየም እንክብል ወስደዋል?",
    prompt_en: "Did you take your prescribed daily Iron-Folic Acid (IFA) or Calcium supplement today?",
  },
  closing: {
    category_am: "አጠቃላይ ስሜት እና ጥያቄዎች",
    category_en: "CLOSING & QUESTIONS",
    prompt_am: "ሌላ የሚያስጨንቅዎት ማንኛውም የጤና ለውጥ፣ ህመም ወይም ጥያቄ አለዎት?",
    prompt_en: "Do you have any other questions, concerns, or symptoms you would like to report?",
  },
} as const;

/** Canonical key normalizer for supplements across the app. */
export function getCanonicalSupplementKey(nameOrId?: string | null): string {
  const s = (nameOrId || "").toLowerCase().trim();
  if (!s) return "unknown";
  if (
    s.includes("iron") ||
    s.includes("ifa") ||
    s.includes("folic") ||
    s.includes("ብረት") ||
    s.includes("ፎሊክ")
  ) {
    return "iron_folic_acid";
  }
  if (s.includes("calcium") || s.includes("ካልሲየም")) {
    return "calcium";
  }
  if (s.includes("vitamin d") || s.includes("vit d") || s.includes("ቫይታሚን ዲ")) {
    return "vitamin_d";
  }
  return s;
}

export function translateSupplementName(name: string, isAmharic: boolean): string {
  if (!isAmharic) return name;
  const key = getCanonicalSupplementKey(name);
  if (key === "iron_folic_acid") return "የብረት እና ፎሊክ አሲድ (IFA)";
  if (key === "calcium") return "የካልሲየም እንክብል";
  if (key === "vitamin_d") return "ቫይታሚን ዲ";
  return name;
}
