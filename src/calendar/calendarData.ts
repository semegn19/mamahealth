export type CalendarItem = {
  id: string;
  title: string;
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

export function starterItems(today: Date): CalendarItem[] {
  const next = (offset: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    date.setDate(date.getDate() + offset);
    return dateKey(date);
  };
  return [
    { id: "sample-1", title: "Midwife appointment", type: "event", date: next(0), time: "10:30", reminderAt: "" },
    { id: "sample-2", title: "Take prenatal vitamins", type: "task", date: next(1), time: "08:00", reminderAt: "" },
    { id: "sample-3", title: "Blood pressure check", type: "task", date: next(3), time: "09:00", reminderAt: "" },
    { id: "sample-4", title: "Prenatal class", type: "event", date: next(5), time: "16:00", reminderAt: "" },
  ];
}

export function initialDueDate(today: Date) {
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  due.setDate(due.getDate() + 84);
  return dateKey(due);
}

export function loadItems(today: Date): CalendarItem[] {
  try {
    const saved = localStorage.getItem(ITEMS_KEY) ?? localStorage.getItem(LEGACY_ITEMS_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as CalendarItem[];
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