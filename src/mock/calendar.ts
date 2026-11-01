import type { CalendarItem } from "../calendar/calendarData";

export function mockDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Seed/starter calendar items for the prototype.
 * Replaced when calendar is backed by the real database/API.
 */
export function mockStarterCalendarItems(today: Date): CalendarItem[] {
  const next = (offset: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    date.setDate(date.getDate() + offset);
    return mockDateKey(date);
  };

  return [
    {
      id: "sample-1",
      title: "Midwife appointment",
      title_am: "የአዋላጅ ቀጠሮ",
      type: "event",
      date: next(0),
      time: "10:30",
      reminderAt: "",
    },
    {
      id: "sample-2",
      title: "Take prenatal vitamins",
      title_am: "የቅድመ ወሊድ ቫይታሚን መውሰድ",
      type: "task",
      date: next(1),
      time: "08:00",
      reminderAt: "",
    },
    {
      id: "sample-3",
      title: "Blood pressure check",
      title_am: "የደም ግፊት ምርመራ",
      type: "task",
      date: next(3),
      time: "09:00",
      reminderAt: "",
    },
    {
      id: "sample-4",
      title: "Prenatal class",
      title_am: "የቅድመ ወሊድ ትምህርት",
      type: "event",
      date: next(5),
      time: "16:00",
      reminderAt: "",
    },
  ];
}

/**
 * Fallback estimated due date (+84 days from today) for prototype exploration.
 */
export function mockInitialDueDate(today: Date): string {
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  due.setDate(due.getDate() + 84);
  return mockDateKey(due);
}

/**
 * A small, predictable mock agenda so the calendar widget on the home dashboard feels alive.
 */
export function mockAgendaFor(date: Date): { title: string; time: string } | null {
  switch (date.getDay()) {
    case 1:
      return { title: "Morning check-in reminder", time: "08:00" };
    case 3:
      return { title: "Midwife check-in", time: "10:30" };
    case 5:
      return { title: "Glucose screening", time: "09:15" };
    case 6:
      return { title: "Prenatal yoga", time: "18:00" };
    default:
      return null;
  }
}
