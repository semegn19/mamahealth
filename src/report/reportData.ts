/**
 * Deterministic sample data for one month of daily voice check-ins.
 * A real build would replace this with the stored check-in history.
 */

const SYMPTOMS = [
  "Nausea",
  "Fatigue",
  "Headache",
  "Back pain",
  "Swelling",
  "Heartburn",
  "Insomnia",
] as const;

/** Lightness ramp stays on-theme but is still readable as a legend. */
export const FOOD_GROUPS = [
  { name: "Grains", color: "#f2ddb0" },
  { name: "Protein", color: "#e9c48a" },
  { name: "Dairy", color: "#d9ab5e" },
  { name: "Fruit", color: "#c99a55" },
  { name: "Veg", color: "#8a5f1d" },
] as const;

export type Severity = 1 | 2 | 3;

export const SEVERITY_LEVELS: Record<Severity, { label: string; color: string }> = {
  1: { label: "Mild", color: "#f2ddb0" },
  2: { label: "Moderate", color: "#dda95f" },
  3: { label: "Severe", color: "#b3853c" },
};

export type DayRecord = {
  date: Date;
  day: number;
  recorded: boolean;
  symptoms: { name: string; severity: Severity }[];
  foodGroups: number[];
  supplement: boolean;
};

/** Small seeded PRNG so the month looks organic but never changes. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMonth(): DayRecord[] {
  const rand = mulberry32(20260914);
  const days: DayRecord[] = [];
  // Reporting period: 1–30 September 2025.
  for (let day = 1; day <= 30; day++) {
    const date = new Date(2025, 8, day);
    const recorded = day !== 4 && day !== 17 && day !== 26 && rand() > 0.12;

    const symptoms: DayRecord["symptoms"] = [];
    if (recorded) {
      const count = Math.floor(rand() * 3) + (day % 7 === 0 ? 1 : 0);
      const pool = [...SYMPTOMS];
      for (let i = 0; i < count && pool.length; i++) {
        const pick = pool.splice(Math.floor(rand() * pool.length), 1)[0];
        symptoms.push({ name: pick, severity: (Math.floor(rand() * 3) + 1) as Severity });
      }
    }

    const foodGroups: number[] = [];
    if (recorded) {
      // Early days of the month show a narrower diet that widens later.
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

export const MONTH: DayRecord[] = buildMonth();

/* ------------------------------------------------------------------ */
/* Derived aggregates                                                   */
/* ------------------------------------------------------------------ */

export const RECORDED_DAYS = MONTH.filter((d) => d.recorded).length;
export const TOTAL_DAYS = MONTH.length;
export const MISSED_DAYS = TOTAL_DAYS - RECORDED_DAYS;
export const CHECKIN_RATE = Math.round((RECORDED_DAYS / TOTAL_DAYS) * 100);

/** Worst severity recorded on a day, used to tint the calendar. */
export function worstSeverity(day: DayRecord): Severity | null {
  if (!day.recorded || day.symptoms.length === 0) return null;
  return day.symptoms.reduce((max, s) => (s.severity > max ? s.severity : max), 1 as Severity);
}

export const SYMPTOM_TOTALS = (() => {
  const map = new Map<string, { count: number; severitySum: number }>();
  for (const day of MONTH) {
    for (const s of day.symptoms) {
      const entry = map.get(s.name) ?? { count: 0, severitySum: 0 };
      entry.count += 1;
      entry.severitySum += s.severity;
      map.set(s.name, entry);
    }
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      count: v.count,
      avg: Math.round((v.severitySum / v.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);
})();

export const DAYS_WITH_SYMPTOMS = MONTH.filter((d) => d.symptoms.length > 0).length;

export const FOOD_COVERAGE_DAYS = MONTH.filter((d) => d.foodGroups.length === 5).length;

export type SupplementReport = {
  id: string;
  name: string;
  entries: { day: number; taken: boolean | null }[];
  takenDays: number;
  missedDays: number;
  loggedDays: number;
  unloggedDays: number;
  percent: number | null;
};

// Separate sample entries allow a supplement question to be skipped without
// treating an unlogged dose as missed or changing the existing check-in data.
const SAMPLE_SUPPLEMENTS = [
  {
    id: "iron",
    name: "Iron",
    missed: [15, 23],
    unlogged: [3, 7, 11, 18, 20, 24, 28],
  },
  {
    id: "folic-acid",
    name: "Folic acid",
    missed: [2, 9, 12, 19, 22, 27],
    unlogged: [],
  },
];

export const SUPPLEMENT_REPORTS: SupplementReport[] = SAMPLE_SUPPLEMENTS.map((supplement) => {
  const entries = MONTH.map((day) => ({
    day: day.day,
    taken: !day.recorded || supplement.unlogged.includes(day.day)
      ? null
      : !supplement.missed.includes(day.day),
  }));
  const takenDays = entries.filter((entry) => entry.taken === true).length;
  const missedDays = entries.filter((entry) => entry.taken === false).length;
  const loggedDays = takenDays + missedDays;

  return {
    id: supplement.id,
    name: supplement.name,
    entries,
    takenDays,
    missedDays,
    loggedDays,
    unloggedDays: entries.length - loggedDays,
    percent: loggedDays > 0 ? Math.round((takenDays / loggedDays) * 100) : null,
  };
});

export const AVG_FOOD_GROUPS =
  Math.round(
    (MONTH.reduce((sum, d) => sum + d.foodGroups.length, 0) / RECORDED_DAYS) * 10
  ) / 10;

/** Calendar grid, Monday-first, padded to whole weeks. */
export const CALENDAR_CELLS: (DayRecord | null)[] = (() => {
  const first = MONTH[0].date;
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  return [...Array.from({ length: lead }, () => null), ...MONTH];
})();

export const PERIOD = {
  label: "September 2025",
  appointment: "3rd appointment",
  displayRange: "Thu 9 Oct to Wed Nov 8",
  generatedAt: "November 7, 2025  10:30 pm",
  clinician: "Dr. Naomi Adeyemi",
};

/** Typical foods logged inside each group during the month. */
export const FOOD_ITEMS: { name: string; items: string[] }[] = [
  { name: "Grains", items: ["Oats", "Rice", "Injera", "Wholegrain bread", "Quinoa"] },
  { name: "Protein", items: ["Lentils", "Eggs", "Chicken", "Fish", "Beans"] },
  { name: "Dairy", items: ["Milk", "Yogurt", "Cheese"] },
  { name: "Fruit", items: ["Banana", "Mango", "Orange", "Apple", "Berries"] },
  { name: "Veg", items: ["Spinach", "Kale", "Carrots", "Tomatoes", "Broccoli"] },
];

/**
 * How many times each food was logged. Seeded separately so MONTH stays stable.
 * Counts only include foods that were actually eaten.
 */
export const FOOD_ITEM_COUNTS: Record<string, { name: string; times: number }[]> = (() => {
  const rand = mulberry32(20260988);
  const result: Record<string, { name: string; times: number }[]> = {};

  FOOD_ITEMS.forEach((group, groupIndex) => {
    const days = MONTH.filter((d) => d.foodGroups.includes(groupIndex)).length;
    const rows = group.items
      .map((name, i) => {
        // Earlier items in the list are eaten more often; a few may be rare.
        const weight = 1 - i * 0.12;
        const times = Math.max(1, Math.round(days * (0.35 + rand() * 0.55) * weight));
        return { name, times };
      })
      .sort((a, b) => b.times - a.times);
    result[group.name] = rows;
  });

  return result;
})();
