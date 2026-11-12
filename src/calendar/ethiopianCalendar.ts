import { MonthGrid, monthNames, toEC, toGC } from "kenat";

export type EthiopianDate = {
  year: number;
  month: number;
  day: number;
};

export type EthiopianMonthCell = {
  ethDay: number | string;
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  isToday: boolean;
};

/**
 * Converts a JavaScript Gregorian Date object to an Ethiopian { year, month, day }.
 */
export function gregorianDateToEthiopian(date: Date): EthiopianDate {
  const ec = toEC(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    year: ec.year,
    month: ec.month,
    day: ec.day,
  };
}

/**
 * Converts an Ethiopian { year, month, day } to a JavaScript Gregorian Date object.
 */
export function ethiopianToGregorianDate(year: number, month: number, day: number): Date {
  const gc = toGC(year, month, day);
  return new Date(gc.year, gc.month - 1, gc.day);
}

/**
 * Shifts an Ethiopian year and month by an offset (-1 or +1).
 * Handles the 13th month (Pagume) transition correctly.
 */
export function shiftEthiopianMonth(
  year: number,
  month: number,
  offset: number
): { year: number; month: number } {
  let m = month + offset;
  let y = year;
  while (m > 13) {
    m -= 13;
    y += 1;
  }
  while (m < 1) {
    m += 13;
    y -= 1;
  }
  return { year: y, month: m };
}

/**
 * Formats an Ethiopian month and year into a title string.
 * Example (Amharic): "ጥቅምት 2019 ዓ.ም."
 * Example (English): "Tikimt 2019 E.C."
 */
export function formatEthiopianMonthTitle(
  year: number,
  month: number,
  isAmharic: boolean
): string {
  const mIndex = Math.max(0, Math.min(12, month - 1));
  const name = isAmharic
    ? (monthNames.amharic[mIndex] ?? `ወር ${month}`)
    : (monthNames.english[mIndex] ?? `Month ${month}`);
  const era = isAmharic ? "ዓ.ም." : "E.C.";
  return `${name} ${year} ${era}`;
}

/**
 * Formats a Gregorian Date as an Ethiopian date title.
 * Example (Amharic): "ሰኞ፣ ጥቅምት 23 2019 ዓ.ም."
 * Example (English): "Monday, Tikimt 23, 2019 E.C."
 */
export function formatEthiopianDayTitle(date: Date, isAmharic: boolean): string {
  const eth = gregorianDateToEthiopian(date);
  const weekdayName = date.toLocaleDateString(isAmharic ? "am-ET" : "en-US", { weekday: "long" });
  const mIndex = Math.max(0, Math.min(12, eth.month - 1));
  const monthName = isAmharic
    ? (monthNames.amharic[mIndex] ?? `ወር ${eth.month}`)
    : (monthNames.english[mIndex] ?? `Month ${eth.month}`);
  const era = isAmharic ? "ዓ.ም." : "E.C.";
  const sep = isAmharic ? "፣ " : ", ";
  return `${weekdayName}${sep}${monthName} ${eth.day} ${eth.year} ${era}`;
}

/**
 * Formats a Gregorian Date as a short Ethiopian date string (Month + Day).
 * Example (Amharic): "ጥቅምት 23"
 * Example (English): "Tikimt 23"
 */
export function formatEthiopianShortDate(date: Date, isAmharic: boolean): string {
  const eth = gregorianDateToEthiopian(date);
  const mIndex = Math.max(0, Math.min(12, eth.month - 1));
  const monthName = isAmharic
    ? (monthNames.amharic[mIndex] ?? `ወር ${eth.month}`)
    : (monthNames.english[mIndex] ?? `Month ${eth.month}`);
  return `${monthName} ${eth.day}`;
}

/**
 * Builds the month cells grid for the Ethiopian calendar using Kenat's MonthGrid.
 * weekStart: 0 sets Sunday as the first column, matching the Gregorian grid.
 */
export function getEthiopianMonthCells(
  year: number,
  month: number
): (EthiopianMonthCell | null)[] {
  const grid = new MonthGrid({
    year,
    month,
    weekStart: 0,
    weekdayLang: "amharic",
    useGeez: false,
  }).generate();

  return grid.days.map((day) => {
    if (!day) return null;
    const g = day.gregorian;
    const jsDate = new Date(g.year, g.month - 1, g.day);
    const dateKey = `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`;
    return {
      ethDay: day.ethiopian.day,
      date: jsDate,
      dateKey,
      isToday: Boolean(day.isToday),
    };
  });
}
