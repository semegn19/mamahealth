import type { ReportArchiveItem } from "../report/reportCatalog";
import type { DayRecord, Severity } from "../report/reportData";

/**
 * Historical compiled ANC reports for prototype display.
 * Replaced when reports API is connected.
 */
export const MOCK_REPORT_ARCHIVE: ReportArchiveItem[] = [
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

const MOCK_SYMPTOMS = [
  "Nausea",
  "Fatigue",
  "Headache",
  "Back pain",
  "Swelling",
  "Heartburn",
  "Insomnia",
] as const;

/** Small seeded PRNG so the synthetic month looks organic but remains deterministic. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic sample data for one month of daily voice check-ins (1–30 September 2025).
 * Replaced with live check-in aggregates from backend.
 */
export function buildMockMonth(): DayRecord[] {
  const rand = mulberry32(20260914);
  const days: DayRecord[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(2025, 8, day);
    const recorded = day !== 4 && day !== 17 && day !== 26 && rand() > 0.12;

    const symptoms: DayRecord["symptoms"] = [];
    if (recorded) {
      const count = Math.floor(rand() * 3) + (day % 7 === 0 ? 1 : 0);
      const pool = [...MOCK_SYMPTOMS];
      for (let i = 0; i < count && pool.length; i++) {
        const pick = pool.splice(Math.floor(rand() * pool.length), 1)[0];
        symptoms.push({ name: pick, severity: (Math.floor(rand() * 3) + 1) as Severity });
      }
    }

    const foodGroups: number[] = [];
    if (recorded) {
      const coverage = Math.min(5, 2 + Math.floor(rand() * 3) + (day > 12 ? 1 : 0));
      const pool = [0, 1, 2, 3, 4];
      for (let i = 0; i < coverage; i++) {
        foodGroups.push(...pool.splice(Math.floor(rand() * pool.length), 1));
      }
    }

    days.push({
      date,
      day,
      recorded,
      symptoms,
      foodGroups: foodGroups.sort((a, b) => a - b),
      supplement: recorded ? rand() > 0.22 : false,
    });
  }
  return days;
}

export const MOCK_MONTH: DayRecord[] = buildMockMonth();

export const MOCK_PERIOD = {
  label: "September 2025",
  appointment: "3rd appointment",
  displayRange: "Thu 9 Oct to Wed Nov 8",
  generatedAt: "November 7, 2025  10:30 pm",
  clinician: "Dr. Naomi Adeyemi",
};

/** Typical foods logged inside each group during the month. */
export const MOCK_FOOD_ITEMS: { name: string; items: string[] }[] = [
  { name: "Grains", items: ["Oats", "Rice", "Injera", "Wholegrain bread", "Quinoa"] },
  { name: "Protein", items: ["Lentils", "Eggs", "Chicken", "Fish", "Beans"] },
  { name: "Dairy", items: ["Milk", "Yogurt", "Cheese"] },
  { name: "Fruit", items: ["Banana", "Mango", "Orange", "Apple", "Berries"] },
  { name: "Veg", items: ["Spinach", "Kale", "Carrots", "Tomatoes", "Broccoli"] },
];

/**
 * How many times each food was logged in the mock dataset.
 * Seeded separately so MOCK_MONTH stays stable.
 */
export const MOCK_FOOD_ITEM_COUNTS: Record<string, { name: string; times: number }[]> = (() => {
  const rand = mulberry32(20260988);
  const result: Record<string, { name: string; times: number }[]> = {};

  MOCK_FOOD_ITEMS.forEach((group, groupIndex) => {
    const days = MOCK_MONTH.filter((d) => d.foodGroups.includes(groupIndex)).length;
    const rows = group.items
      .map((name, i) => {
        const weight = 1 - i * 0.12;
        const times = Math.max(1, Math.round(days * (0.35 + rand() * 0.55) * weight));
        return { name, times };
      })
      .sort((a, b) => b.times - a.times);
    result[group.name] = rows;
  });

  return result;
})();

