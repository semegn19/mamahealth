/* ------------------------------------------------------------------ */
/* Onboarding store                                                    */
/* ------------------------------------------------------------------ */

export type Residence = "Rural" | "Urban";

export type DatingMode = "lmp" | "known";
export type CalendarSystem = "gregorian" | "ethiopian";

export type OnboardingData = {
  age: string;
  residence: Residence | "";
  hospital: string;
  customHospital: string;
  totalPregnancies: number;
  liveBirths: number;
  dating: DatingMode;
  calendar: CalendarSystem;
  lmpDay: string;
  lmpMonth: string;
  lmpYear: string;
  knownWeeks: string;
  knownDays: string;
  // Stage 3 — obstetric history & risk factors (null = unanswered)
  hadCesarean: boolean | null;
  hadStillbirth: boolean | null;
  malariaArea: boolean | null;
  complications: string[];
  customComplications: string[];
  // Stage 4 — known medical conditions
  conditions: string[];
  customConditions: string[];
  // Stage 5 — medications
  takesMedications: boolean | null;
  medications: string[];
  // Stage 6 — supplements
  takesSupplements: boolean | null;
  supplementChoices: string[];
  completed: boolean;
};

const KEY = "mama-health-onboarding-v1";
const LEGACY_KEY = "aurelia-onboarding-v1";

export const EMPTY_ONBOARDING: OnboardingData = {
  age: "",
  residence: "Urban",
  hospital: "",
  customHospital: "",
  totalPregnancies: 1,
  liveBirths: 0,
  dating: "lmp",
  calendar: "gregorian",
  lmpDay: "",
  lmpMonth: "",
  lmpYear: "",
  knownWeeks: "",
  knownDays: "0",
  hadCesarean: null,
  hadStillbirth: null,
  malariaArea: null,
  complications: [],
  customComplications: [],
  conditions: [],
  customConditions: [],
  takesMedications: null,
  medications: [],
  takesSupplements: null,
  supplementChoices: [],
  completed: false,
};

export const COMPLICATION_OPTIONS = [
  "Preterm Birth (< 37 weeks)",
  "Pre-eclampsia / Toxemia",
  "Postpartum Hemorrhage (PPH)",
  "Gestational Diabetes",
];

export const CONDITION_OPTIONS = [
  "Chronic Hypertension",
  "Pre-existing Diabetes",
  "Anemia / Low Iron",
  "Cardiac Disease",
];

export const SUPPLEMENT_CHOICE_OPTIONS = [
  "Iron & Folic Acid (IFA)",
  "Calcium Supplement",
  "Multiple Micronutrients (MMN)",
];

export const ETHIOPIAN_HOSPITALS = [
  "Tikur Anbessa Specialized Hospital (Black Lion)",
  "Gandhi Memorial Hospital",
  "St. Paul's Hospital Millennium Medical College",
  "Zewditu Memorial Hospital",
  "Tirunesh Beijing General Hospital",
  "Yekatit 12 Hospital Medical College",
  "Ras Desta Damtew Memorial Hospital",
  "Other / Health Center",
];

export function loadOnboarding(): OnboardingData {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingData>;
      return {
        ...EMPTY_ONBOARDING,
        ...parsed,
        hospital: typeof parsed.hospital === "string" ? parsed.hospital : "",
        customHospital: typeof parsed.customHospital === "string" ? parsed.customHospital : "",
        calendar:
          parsed.calendar === "ethiopian" || parsed.calendar === "gregorian"
            ? parsed.calendar
            : "gregorian",
        customComplications: Array.isArray(parsed.customComplications)
          ? parsed.customComplications
          : [],
        customConditions: Array.isArray(parsed.customConditions) ? parsed.customConditions : [],
      };
    }
  } catch {
    // Storage unavailable — use defaults.
  }
  return EMPTY_ONBOARDING;
}

export function saveOnboarding(data: OnboardingData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // In-memory progress still works.
  }
}

/* ------------------------------------------------------------------ */
/* Calendars                                                           */
/* ------------------------------------------------------------------ */

const floor = Math.floor;
const mod = (value: number, base: number) => ((value % base) + base) % base;

/** Gregorian calendar date → Julian Day Number. */
export function gregorianToJdn(year: number, month: number, day: number) {
  const a = floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    floor((153 * m + 2) / 5) +
    365 * y +
    floor(y / 4) -
    floor(y / 100) +
    floor(y / 400) -
    32045
  );
}

/** Julian Day Number → Gregorian calendar date. */
export function jdnToGregorian(jdn: number) {
  const a = jdn + 32044;
  const b = floor((4 * a + 3) / 146097);
  const c = a - floor((146097 * b) / 4);
  const d = floor((4 * c + 3) / 1461);
  const e = c - floor((1461 * d) / 4);
  const m = floor((5 * e + 2) / 153);
  return {
    day: e - floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * floor(m / 10),
    year: 100 * b + d - 4800 + floor(m / 10),
  };
}

const ETHIOPIAN_EPOCH = 1723856;

/** Ethiopian (Amete Mihret) date → Julian Day Number. */
export function ethiopianToJdn(year: number, month: number, day: number) {
  return (
    ETHIOPIAN_EPOCH +
    365 +
    365 * (year - 1) +
    floor(year / 4) +
    30 * month +
    day -
    31
  );
}

/** Julian Day Number → Ethiopian (Amete Mihret) date. */
export function jdnToEthiopian(jdn: number) {
  const r = mod(jdn - ETHIOPIAN_EPOCH, 1461);
  const n = mod(r, 365) + 365 * floor(r / 1460);
  const year =
    4 * floor((jdn - ETHIOPIAN_EPOCH) / 1461) + floor(r / 365) - floor(r / 1460);
  return {
    day: mod(n, 30) + 1,
    month: floor(n / 30) + 1,
    year,
  };
}

export const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miyazya",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

export const GREGORIAN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function daysInGregorianMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function daysInEthiopianMonth(year: number, month: number) {
  if (month !== 13) return 30;
  // Pagume has 6 days in the year before a Gregorian leap year.
  const nextEthiopianYear = year + 1;
  const newYearJdn = ethiopianToJdn(nextEthiopianYear, 1, 1);
  const gregorianNewYear = jdnToGregorian(newYearJdn);
  const days = mod(gregorianNewYear.year, 4) === 0 && (mod(gregorianNewYear.year, 100) !== 0 || mod(gregorianNewYear.year, 400) === 0) ? 6 : 5;
  return days;
}

/** Convert an entered LMP date (either calendar) to a Gregorian Date. */
export function lmpToGregorian(
  calendar: CalendarSystem,
  day: number,
  month: number,
  year: number,
): Date {
  const jdn =
    calendar === "gregorian"
      ? gregorianToJdn(year, month, day)
      : ethiopianToJdn(year, month, day);
  const gregorian = jdnToGregorian(jdn);
  return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
}

const DAY_MS = 86400000;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Gestation from an LMP date, using a 280-day term. */
export function gestationFromLmp(lmp: Date, today = new Date()) {
  const days = Math.round((startOfDay(today).getTime() - startOfDay(lmp).getTime()) / DAY_MS);
  const weeks = Math.floor(days / 7);
  const remainingDays = mod(days, 7);
  const dueDate = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate() + 280);
  const trimester = days < 0 ? 0 : days <= 97 ? 1 : days <= 195 ? 2 : 3;
  return { days, weeks, remainingDays, dueDate, trimester };
}

/** Gestation from a known weeks/days value. */
export function gestationFromKnown(weeks: number, days: number, today = new Date()) {
  const total = weeks * 7 + days;
  const dueDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + (280 - total),
  );
  const trimester = total <= 97 ? 1 : total <= 195 ? 2 : 3;
  return { days: total, weeks, remainingDays: days, dueDate, trimester };
}

export function formatGregorian(date: Date) {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function formatEthiopian(date: Date) {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const ethiopian = jdnToEthiopian(jdn);
  return `${ethiopian.day} ${ETHIOPIAN_MONTHS[ethiopian.month - 1]} ${ethiopian.year}`;
}
