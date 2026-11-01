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

export const SEVERITY_LEVELS: Record<Severity, { label: string; label_am: string; color: string }> = {
  1: { label: "Mild", label_am: "ቀላል", color: "#f2ddb0" },
  2: { label: "Moderate", label_am: "መካከለኛ", color: "#dda95f" },
  3: { label: "Severe", label_am: "ከፍተኛ", color: "#b3853c" },
};

export type DayRecord = {
  date: Date;
  day: number;
  recorded: boolean;
  symptoms: { name: string; severity: Severity }[];
  foodGroups: number[];
  supplement: boolean;
};

import {
  MOCK_FOOD_ITEM_COUNTS as FOOD_ITEM_COUNTS,
  MOCK_FOOD_ITEMS as FOOD_ITEMS,
  MOCK_MONTH,
  MOCK_PERIOD as PERIOD,
} from "../mock/reports";

export const MONTH: DayRecord[] = MOCK_MONTH;

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

export { PERIOD, FOOD_ITEMS, FOOD_ITEM_COUNTS };
