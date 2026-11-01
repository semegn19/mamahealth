export type CalendarItem = {
  id: string;
  title: string;
  title_am?: string;
  type: "event" | "task";
  date: string;
  time: string;
  reminderAt: string;
};

export const ITEMS_KEY = "mama-health-calendar-items-v1";
export const LEGACY_ITEMS_KEY = "aurelia-calendar-items-v1";
export const DUE_DATE_KEY = "mama-health-due-date-v1";
export const LEGACY_DUE_DATE_KEY = "aurelia-due-date-v1";

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfWeek(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - result.getDay());
  return result;
}

import { mockInitialDueDate, mockStarterCalendarItems } from "../mock/calendar";

export function starterItems(today: Date): CalendarItem[] {
  return mockStarterCalendarItems(today);
}

export function initialDueDate(today: Date): string {
  return mockInitialDueDate(today);
}

export function loadItems(today: Date): CalendarItem[] {
  try {
    const saved = localStorage.getItem(ITEMS_KEY) ?? localStorage.getItem(LEGACY_ITEMS_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return (parsed as CalendarItem[]).map((item) => {
          const starter = starterItems(today).find((s) => s.id === item.id);
          return {
            ...item,
            title_am: starter?.title_am ?? item.title_am,
          };
        });
      }
    }
  } catch {
    // Storage may be disabled; fall back to prototype events.
  }
  return starterItems(today);
}

export function loadDueDate(today: Date) {
  try {
    const stored = localStorage.getItem(DUE_DATE_KEY) ?? localStorage.getItem(LEGACY_DUE_DATE_KEY);
    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) return stored;
  } catch {
    // Storage may be disabled; keep the sample due date in memory.
  }
  return initialDueDate(today);
}
