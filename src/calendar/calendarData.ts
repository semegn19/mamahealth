import type { BackendCalendarItem, CalendarItemCreatePayload } from "@/api/calendar";

export type CalendarItem = {
  id: string;
  title: string;
  title_am?: string;
  type: "event" | "task";
  date: string;
  time: string;
  reminderAt: string;
  completed?: boolean;
};

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

export function deduplicateCalendarItems(items: CalendarItem[]): CalendarItem[] {
  const seen = new Set<string>();
  const result: CalendarItem[] = [];

  for (const item of items) {
    if (!item) continue;
    const normDate = (item.date || "").trim();
    const normTime = (item.time || "09:00").slice(0, 5);
    const rawTitle = (item.title || "").toLowerCase().trim().replace(/\s+/g, " ");

    // Normalize ANC contact variants (e.g., "1st ANC Contact (Up to 12 Weeks)", "1st ANC Contact", "1ኛ የቅድመ ወሊድ ክትትል")
    let normTitle = rawTitle;
    const ancMatch = rawTitle.match(/^(\d+)(?:st|nd|rd|th|ኛ)?\s+(?:anc\s+contact|የቅድመ\s+ወሊድ\s+ክትትል)/i);
    if (ancMatch) {
      normTitle = `anc-contact-${ancMatch[1]}`;
    }

    const key = `${normDate}|${normTime}|${normTitle}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

export function starterItems(_today: Date): CalendarItem[] {
  return [];
}

export function initialDueDate(today: Date): string {
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  due.setDate(due.getDate() + 280);
  return dateKey(due);
}

export function loadItems(today: Date): CalendarItem[] {
  return [];
}

export function loadDueDate(today: Date): string {
  return initialDueDate(today);
}

export function backendToFrontendItem(item: BackendCalendarItem): CalendarItem {
  const timeStr = item.time ? item.time.slice(0, 5) : "09:00";
  return {
    id: item.id,
    title: item.title,
    title_am: item.title_am ?? undefined,
    type: item.type,
    date: item.date,
    time: timeStr,
    reminderAt: item.reminder_at ?? "",
    completed: item.completed ?? false,
  };
}

export function frontendToBackendPayload(item: CalendarItem): CalendarItemCreatePayload {
  let timeStr: string | null = null;
  if (item.time) {
    timeStr = item.time.length === 5 ? `${item.time}:00` : item.time;
  }
  return {
    title: item.title,
    title_am: item.title_am || null,
    type: item.type,
    date: item.date,
    time: timeStr,
    reminder_at: item.reminderAt ? new Date(item.reminderAt).toISOString() : null,
    completed: item.completed ?? false,
  };
}
