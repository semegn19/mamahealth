export type MockUtterance = {
  prompt_en: string;
  prompt_am: string;
  answer_en: string;
  answer_am: string;
};

export type MockSimulatedDangerSign = {
  name: string;
  detail: string;
  severity: "Critical";
};

/**
 * Sample check-in utterances used by the voice intake prototype.
 * Replaced when live audio streaming and STT/triage backend endpoints are connected.
 */
export const MOCK_UTTERANCES: MockUtterance[] = [
  {
    prompt_en: "How are you feeling today?",
    prompt_am: "ዛሬ እንዴት ነዎት?",
    answer_en: "A little tired, with a mild headache after lunch.",
    answer_am: "ትንሽ ድካም ተሰምቶኛል፣ ከምሳ በኋላም ትንሽ ራስ ምታት ነበረኝ።",
  },
  {
    prompt_en: "Any symptoms since yesterday?",
    prompt_am: "ከትላንት ወዲህ የተሰማዎት የጤና ለውጥ አለ?",
    answer_en: "Some nausea in the mornings, but it has eased off.",
    answer_am: "ጠዋት ላይ ትንሽ ማቅለሽለሽ ነበረኝ ግን አሁን ለቆኛል።",
  },
  {
    prompt_en: "What did you eat today?",
    prompt_am: "ዛሬ ምን ተመገቡ?",
    answer_en: "Oatmeal for breakfast, a chicken salad, and a glass of milk.",
    answer_am: "ጠዋት አጃ ከወተት ጋር፣ ለምሳ የዶሮ ሰላጣ እና አንድ ብርጭቆ ወተት።",
  },
];

/**
 * Prototype-only simulated clinical danger sign.
 * Replaced when backend clinical triage rules determine real findings.
 */
export const MOCK_SIMULATED_DANGER_SIGN: MockSimulatedDangerSign = {
  name: "Severe headache with blurred vision",
  detail:
    "You described a headache lasting over 6 hours that rest hasn't eased, together with blurred vision.",
  severity: "Critical",
};
