import type { CheckinDangerSign, CheckinEntry } from "../components/CheckinReportSheet";
import type { CheckinLog } from "../logs/checkinLogsData";

const Q = {
  feeling: {
    en: "How are you feeling today?",
    am: "ዛሬ እንዴት ነዎት?",
  },
  symptoms: {
    en: "Any symptoms since yesterday?",
    am: "ከትላንት ወዲህ የተሰማዎት የጤና ለውጥ አለ?",
  },
  food: {
    en: "What did you eat today?",
    am: "ዛሬ ምን ተመገቡ?",
  },
  sleep: {
    en: "How did you sleep?",
    am: "እንቅልፍዎ እንዴት ነበር?",
  },
} as const;

function entry(
  question: { en: string; am: string },
  answer_en: string | null,
  answer_am: string | null,
  severity: number | null,
): CheckinEntry {
  return {
    question: question.en,
    question_am: question.am,
    answer: answer_en,
    answer_am,
    severity,
    skipped: answer_en === null,
  };
}

/**
 * Historical daily check-in logs for prototyping.
 * Replaced by GET /checkins/history when backend integration is enabled.
 */
export const MOCK_CHECKIN_LOGS: CheckinLog[] = [
  {
    id: "2025-11-08",
    date: new Date(2025, 10, 8, 7, 48),
    session: "Morning",
    entries: [
      entry(
        Q.feeling,
        "A severe headache that has not eased after resting.",
        "እረፍት ከወሰድኩ በኋላም ያልቀነሰ ከባድ ራስ ምታት።",
        88,
      ),
      entry(
        Q.symptoms,
        "Headache has lasted more than six hours, with some blurred vision.",
        "ራስ ምታቱ ከስድስት ሰዓት በላይ ቆይቷል፣ ከዓይን ብዥታ ጋር።",
        86,
      ),
      entry(
        Q.food,
        "Toast, yogurt, and water.",
        "ዳቦ፣ እርጎ እና ውሃ።",
        15,
      ),
    ],
    dangerSigns: [
      {
        name: "Severe headache",
        name_am: "ከፍተኛ ራስ ምታት",
        detail: "Lasting 6+ hours, not eased by rest; blurred vision also reported.",
        detail_am: "ከ6 ሰዓታት በላይ የቆየ፣ በእረፍት ያልቀነሰ እና የዓይን ብዥታ የታየበት።",
        severity: "Critical",
      },
    ],
  },
  {
    id: "2025-11-07",
    date: new Date(2025, 10, 7, 8, 12),
    session: "Morning",
    entries: [
      entry(
        Q.feeling,
        "Much better today, energy is back.",
        "ዛሬ በጣም ተሽሎኛል፣ ብርታት ተሰምቶኛል።",
        20,
      ),
      entry(
        Q.symptoms,
        "No nausea since breakfast, just mild fatigue.",
        "ከቁርስ በኋላ ማቅለሽለሽ አልነበረም፣ ቀላል ድካም ብቻ።",
        30,
      ),
      entry(
        Q.food,
        "Oatmeal with banana, eggs, and a glass of milk.",
        "አጃ ከሙዝ ጋር፣ እንቁላል እና አንድ ብርጭቆ ወተት።",
        10,
      ),
    ],
  },
  {
    id: "2025-11-06",
    date: new Date(2025, 10, 6, 19, 40),
    session: "Evening",
    entries: [
      entry(
        Q.feeling,
        "Tired but steady, a bit of lower back pain.",
        "ትንሽ ድካም እና የወገብ ህመም አለብኝ።",
        45,
      ),
      entry(
        Q.symptoms,
        "Back pain eased after resting, no headaches.",
        "ካረፍኩ በኋላ የወገቤ ህመም ቀለል ብሏል፣ ራስ ምታት የለም።",
        40,
      ),
      entry(
        Q.food,
        "Lentil stew with rice and steamed vegetables.",
        "የምስር ወጥ ከሩዝ እና ከአትክልት ጋር።",
        15,
      ),
    ],
  },
  {
    id: "2025-11-05",
    date: new Date(2025, 10, 5, 8, 5),
    session: "Morning",
    entries: [
      entry(
        Q.feeling,
        "A little queasy this morning, otherwise okay.",
        "ጠዋት ላይ ትንሽ ማቅለሽለሽ ተሰምቶኝ ነበር፣ በአጠቃላይ ግን ደህና ነኝ።",
        55,
      ),
      entry(
        Q.symptoms,
        "Mild nausea and heartburn after dinner yesterday.",
        "ትናንት ከእራት በኋላ ትንሽ ማቅለሽለሽ እና የሆድ ቃጠሎ ነበረኝ።",
        50,
      ),
      entry(
        Q.food,
        "Toast, yogurt, chicken salad, and an orange.",
        "ዳቦ፣ እርጎ፣ የዶሮ ሰላጣ እና ብርቱካን።",
        25,
      ),
    ],
  },
  {
    id: "2025-11-04",
    date: new Date(2025, 10, 4, 20, 15),
    session: "Evening",
    entries: [
      entry(Q.feeling, null, null, null),
      entry(
        Q.symptoms,
        "Feet were a bit swollen by evening.",
        "ምሽት ላይ እግሮቼ ትንሽ አብጠው ነበር።",
        60,
      ),
      entry(
        Q.food,
        "Fish, rice, carrots, and a mango.",
        "ዓሳ፣ ሩዝ፣ ካሮት እና ማንጎ።",
        20,
      ),
    ],
  },
  {
    id: "2025-11-03",
    date: new Date(2025, 10, 3, 8, 30),
    session: "Morning",
    entries: [
      entry(
        Q.feeling,
        "Good energy, slept through the night.",
        "ጥሩ ስሜት ይሰማኛል፣ ሌሊቱን በደንብ ተኝቻለሁ።",
        15,
      ),
      entry(
        Q.symptoms,
        "No new symptoms, just normal tiredness.",
        "ምንም አዲስ ምልክት የለም፣ የተለመደው ድካም ብቻ።",
        20,
      ),
      entry(
        Q.food,
        "Porridge with milk, an egg, and berries.",
        "ገንፎ ከወተት ጋር፣ እንቁላል እና ፍራፍሬ።",
        10,
      ),
    ],
  },
  {
    id: "2025-11-02",
    date: new Date(2025, 10, 2, 7, 55),
    session: "Morning",
    entries: [
      entry(
        Q.feeling,
        "Woke up feeling rested.",
        "ጥሩ እንቅልፍ ተኝቼ ነው የነቃሁት።",
        10,
      ),
      entry(
        Q.symptoms,
        "No symptoms today.",
        "ዛሬ ምንም ምልክት አልታየብኝም።",
        5,
      ),
      entry(
        Q.food,
        "Injera with shiro and vegetable salad.",
        "እንጀራ በሽሮ እና የአትክልት ሰላጣ።",
        12,
      ),
    ],
  },
];
