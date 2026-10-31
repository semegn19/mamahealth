"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { HomeTopBar } from "@/components/HomeTopBar";
import { useTranslation } from "@/components/languageStore";
import {
  dateKey,
  DUE_DATE_KEY,
  fromDateKey,
  initialDueDate,
  ITEMS_KEY,
  loadDueDate,
  loadItems,
  starterItems,
  startOfWeek,
  type CalendarItem,
} from "./calendarData";

const WEEKDAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAYS_AM = ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"];

const monthTitle = (date: Date, isAmharic: boolean) =>
  date.toLocaleDateString(isAmharic ? "am-ET" : "en-US", { month: "long", year: "numeric" });

const dayTitle = (date: Date, isAmharic: boolean) =>
  date.toLocaleDateString(isAmharic ? "am-ET" : "en-US", { weekday: "long", month: "short", day: "numeric" });

function weekLabel(start: Date, isAmharic: boolean) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const locale = isAmharic ? "am-ET" : "en-US";
  return `${start.toLocaleDateString(locale, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(locale, { month: "short", day: "numeric" })}`;
}

function dueCountdown(due: Date, today: Date, t: (path: string, params?: Record<string, string | number>) => string) {
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return t("calendar.dueWasDays", { days: Math.abs(days) });
  if (days === 0) return t("calendar.dueToday");
  const weeks = Math.floor(days / 7);
  const extraDays = days % 7;
  if (extraDays > 0) {
    return t("calendar.dueInWeeksDays", { weeks, days: extraDays });
  }
  return t("calendar.dueInWeeks", { weeks });
}

function AgendaItems({
  items,
  onEdit,
}: {
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
}) {
  const { t, isAmharic } = useTranslation();

  return (
    <ul className="divide-y divide-[#b98a3e]/15 dark:divide-[#e5be79]/14">
      {items.map((item) => {
        const title = isAmharic ? (item.title_am ?? item.title) : item.title;
        const typeLabel = item.type === "event" ? t("calendar.eventType") : t("calendar.taskType");

        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`${t("common.edit")} ${typeLabel}: ${title}`}
              aria-haspopup="dialog"
              className="group flex min-h-[72px] w-full items-center gap-3 rounded-xl bg-transparent px-1.5 py-3 text-left transition-colors duration-200 hover:bg-white/25 dark:hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79] motion-reduce:transition-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9ab5e]/15 text-[#7b5b2b] dark:bg-[#e5be79]/16 dark:text-[#e5be79]">
                {item.type === "event" ? (
                  <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Check size={17} strokeWidth={1.8} aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-[15px] font-medium leading-snug text-[#3b3226] dark:text-[#f5ede0]">
                  {title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-[#6f6149] dark:text-[#b9a88e]">
                  <Clock3 size={12} aria-hidden="true" />
                  {item.time}
                  <span aria-hidden="true">/</span>
                  <span className="capitalize">{typeLabel}</span>
                  {item.reminderAt && (
                    <span className="ml-1 inline-flex items-center gap-1">
                      <Bell size={12} aria-hidden="true" />
                      {t("calendar.remindMe")}
                    </span>
                  )}
                </span>
              </span>
              <Pencil
                size={15}
                className="shrink-0 text-[#85735a] transition-colors group-hover:text-[#6f5a35] dark:text-[#9c8b72] dark:group-hover:text-[#e5be79]"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ItemEditor({
  initial,
  selectedDate,
  onClose,
  onSave,
  onDelete,
}: {
  initial: CalendarItem | null;
  selectedDate: string;
  onClose: () => void;
  onSave: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CalendarItem>(
    () =>
      initial ?? {
        id: "",
        title: "",
        type: "event",
        date: selectedDate,
        time: "09:00",
        reminderAt: "",
      },
  );
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(initial?.reminderAt));
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (patch: Partial<CalendarItem>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setError("");
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim()) return setError(t("calendar.titleRequired"));
    if (!draft.date || !draft.time) return setError(t("calendar.dateTimeRequired"));
    if (reminderEnabled) {
      if (!draft.reminderAt) return setError(t("calendar.reminderRequired"));
      const reminder = new Date(draft.reminderAt).getTime();
      const scheduled = new Date(`${draft.date}T${draft.time}`).getTime();
      if (!Number.isFinite(reminder) || reminder <= Date.now())
        return setError(t("calendar.reminderFuture"));
      if (reminder > scheduled)
        return setError(t("calendar.reminderBeforeScheduled"));
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      id: draft.id || crypto.randomUUID(),
      reminderAt: reminderEnabled ? draft.reminderAt : "",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-editor-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#4a3416]/26 dark:bg-black/66 px-3 pt-12 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="report-sheet home-glass-warm max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[30px] p-6 pb-[max(28px,env(safe-area-inset-bottom))] sm:rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="calendar-editor-title"
              className="text-[24px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
            >
              {initial ? t("calendar.editReminder") : t("calendar.addEvent")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="home-icon-solid flex h-10 w-10 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce]"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={save}>
          <div>
            <label
              htmlFor="item-title"
              className="block text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]"
            >
              {t("calendar.titleLabel")}
            </label>
            <input
              id="item-title"
              type="text"
              required
              maxLength={80}
              autoFocus
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder={t("calendar.titlePlaceholder")}
              className="mt-2 w-full rounded-2xl border border-[#e6d3ad] bg-[#fffdf7] px-4 py-3 text-[15px] text-[#3b3226] outline-none placeholder:text-[#a99b84] focus:border-[#b8834a] focus:ring-2 focus:ring-[#c9a35d]/25 dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79]"
            />
          </div>

          <fieldset>
            <legend className="text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]">
              {t("calendar.addAs")}
            </legend>
            <div className="mt-2 flex gap-2">
              {(["event", "task"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={draft.type === type}
                  onClick={() => update({ type })}
                  className={`flex-1 rounded-full px-4 py-2.5 text-[14px] font-medium capitalize transition ${
                    draft.type === type
                      ? "bg-[#4a3f30] text-[#fffaf0] dark:bg-[#e5be79] dark:text-[#231b12]"
                      : "border border-[#e6d3ad] bg-[#fffdf7] text-[#6f6149] hover:bg-[#fbe7b8] dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#c7b69c] dark:hover:bg-[#292118]"
                  }`}
                >
                  {type === "event" ? t("calendar.eventType") : t("calendar.taskType")}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="item-date"
                className="block text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]"
              >
                {t("calendar.dateLabel")}
              </label>
              <input
                id="item-date"
                type="date"
                required
                value={draft.date}
                onChange={(event) => update({ date: event.target.value })}
                className="mt-2 w-full min-w-0 rounded-2xl border border-[#e6d3ad] bg-[#fffdf7] px-3 py-3 text-[14px] text-[#3b3226] outline-none focus:border-[#b8834a] focus:ring-2 focus:ring-[#c9a35d]/25 dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
              />
            </div>
            <div>
              <label
                htmlFor="item-time"
                className="block text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]"
              >
                {t("calendar.timeLabel")}
              </label>
              <input
                id="item-time"
                type="time"
                required
                value={draft.time}
                onChange={(event) => update({ time: event.target.value })}
                className="mt-2 w-full min-w-0 rounded-2xl border border-[#e6d3ad] bg-[#fffdf7] px-3 py-3 text-[14px] text-[#3b3226] outline-none focus:border-[#b8834a] focus:ring-2 focus:ring-[#c9a35d]/25 dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
              />
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e9d5ad] bg-[#fff9ec]/72 p-4 dark:border-[#4b3b28] dark:bg-[#241c14]/85">
            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-[#4a3f30] dark:text-[#f0e4ce]">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => {
                  setReminderEnabled(event.target.checked);
                  if (event.target.checked && !draft.reminderAt)
                    update({ reminderAt: `${draft.date}T${draft.time}` });
                }}
                className="h-4 w-4 accent-[#b98a3e] dark:accent-[#e5be79]"
              />
              <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
              {t("calendar.remindMe")}
            </label>
            {reminderEnabled && (
              <div className="mt-3">
                <label
                  htmlFor="reminder-time"
                  className="block text-[12px] text-[#6f6149] dark:text-[#b9a88e]"
                >
                  {t("calendar.reminderDateTime")}
                </label>
                <input
                  id="reminder-time"
                  type="datetime-local"
                  required
                  value={draft.reminderAt}
                  onChange={(event) => update({ reminderAt: event.target.value })}
                  className="mt-2 w-full min-w-0 rounded-xl border border-[#e6d3ad] bg-[#fffdf7] px-3 py-3 text-[14px] text-[#3b3226] outline-none focus:border-[#b8834a] focus:ring-2 focus:ring-[#c9a35d]/25 dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
                />
                <p className="mt-2 text-[12px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
                  {t("calendar.reminderHelp")}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-[#9c3a29] dark:text-[#f08b75]">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            {initial && (
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete) onDelete(initial.id);
                  else setConfirmDelete(true);
                }}
                className="flex items-center justify-center gap-1 rounded-full border border-[#e8a18f] px-4 py-3 text-[13px] font-medium text-[#9c3a29] transition hover:bg-[#f6e0d8] dark:border-[#c65a45]/60 dark:text-[#f08b75] dark:hover:bg-[#c65a45]/18"
              >
                <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                {confirmDelete ? t("calendar.confirmDelete") : t("common.delete")}
              </button>
            )}
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-5 py-3 text-[14px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              {initial ? t("calendar.saveChanges") : t("calendar.addToCalendar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { t, isAmharic } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [items, setItems] = useState<CalendarItem[]>(() => starterItems(today));
  const [dueDate, setDueDate] = useState(() => initialDueDate(today));
  const [isHydrated, setIsHydrated] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [dueDraft, setDueDraft] = useState(() => initialDueDate(today));
  const [editor, setEditor] = useState<{ key: string; item: CalendarItem | null } | null>(null);
  const [message, setMessage] = useState("");
  const firedRef = useRef(new Set<string>());

  const weekdays = isAmharic ? WEEKDAYS_AM : WEEKDAYS_EN;

  useEffect(() => {
    const loadedItems = loadItems(today);
    const loadedDue = loadDueDate(today);
    setItems(loadedItems);
    setDueDate(loadedDue);
    setDueDraft(loadedDue);
    setIsHydrated(true);
  }, [today]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    } catch {
      /* In-memory editing still works. */
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(DUE_DATE_KEY, dueDate);
    } catch {
      /* In-memory editing still works. */
    }
  }, [dueDate, isHydrated]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 4600);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      items.forEach((item) => {
        if (!item.reminderAt) return;
        const when = new Date(item.reminderAt).getTime();
        const key = `${item.id}:${item.reminderAt}`;
        if (when > now || now - when > 60000 || firedRef.current.has(key)) return;
        firedRef.current.add(key);
        const title = isAmharic ? (item.title_am ?? item.title) : item.title;
        setMessage(t("calendar.reminderPrefix", { title }));
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(t("calendar.reminderNotificationTitle"), { body: title });
          } catch {
            /* In-app reminder still appears. */
          }
        }
      });
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 15000);
    document.addEventListener("visibilitychange", checkReminders);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", checkReminders);
    };
  }, [items, isAmharic, t]);

  const monthCells = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: first.getDay() }, () => null),
      ...Array.from(
        { length: count },
        (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1),
      ),
    ];
  }, [visibleMonth]);

  const selectedWeek = useMemo(() => startOfWeek(selected), [selected]);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(selectedWeek);
        date.setDate(selectedWeek.getDate() + i);
        return date;
      }),
    [selectedWeek],
  );

  const plannedDays = weekDays.filter((date) => {
    const key = dateKey(date);
    return key === dueDate || items.some((item) => item.date === key);
  });

  const selectedItems = useMemo(
    () =>
      items
        .filter((item) => item.date === dateKey(selected))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [items, selected],
  );

  const due = fromDateKey(dueDate);
  const dueText = dueCountdown(
    due,
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    t,
  );

  const shiftMonth = (offset: number) => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(next);
    setSelected(next);
  };
  const selectDate = (date: Date) => setSelected(date);
  const editItem = (item: CalendarItem) => setEditor({ key: item.id, item });

  const saveItem = (item: CalendarItem) => {
    setItems((current) =>
      current.some((existing) => existing.id === item.id)
        ? current.map((existing) => (existing.id === item.id ? item : existing))
        : [...current, item],
    );
    setSelected(fromDateKey(item.date));
    setVisibleMonth(new Date(Number(item.date.slice(0, 4)), Number(item.date.slice(5, 7)) - 1, 1));
    setEditor(null);
    setMessage(
      item.id.startsWith("sample-") || items.some((existing) => existing.id === item.id)
        ? t("calendar.entryUpdated")
        : t("calendar.addedToCalendar"),
    );
    if (item.reminderAt && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setEditor(null);
    setMessage(t("calendar.entryDeleted"));
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-30 blur-[105px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[920px] md:px-8">
        <HomeTopBar />

        <div className="mt-8">
          <h1 className="text-[34px] font-light leading-none tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]">
            {t("calendar.title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            {dueText}
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          <div className="min-w-0 space-y-5">
            <section
              aria-label={t("calendar.title")}
              data-dashboard-card
              className="home-glass rounded-[28px] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                  {monthTitle(visibleMonth, isAmharic)}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ecdb] text-[#6f6149] transition hover:bg-[#efe2c8] active:scale-95 dark:bg-[#2d241b] dark:text-[#d8c7ab] dark:hover:bg-[#382d22]"
                  >
                    <ChevronLeft size={17} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ecdb] text-[#6f6149] transition hover:bg-[#efe2c8] active:scale-95 dark:bg-[#2d241b] dark:text-[#d8c7ab] dark:hover:bg-[#382d22]"
                  >
                    <ChevronRight size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-7 gap-1.5" aria-hidden="true">
                {weekdays.map((day, i) => (
                  <span
                    key={i}
                    className="text-center text-[12px] text-[#9b8a6f] dark:text-[#9c8b72]"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {monthCells.map((date, i) => {
                  if (!date) return <span key={`blank-${i}`} />;
                  const key = dateKey(date);
                  const isSelected = key === dateKey(selected);
                  const isToday = key === dateKey(today);
                  const isDue = key === dueDate;
                  const count = items.filter((item) => item.date === key).length;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${dayTitle(date, isAmharic)}${isDue ? `, ${t("calendar.dueDate")}` : ""}${
                        count ? `, ${count}` : ""
                      }`}
                      aria-pressed={isSelected}
                      aria-controls="selected-day-agenda"
                      onClick={() => selectDate(date)}
                      className={`relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-full text-[14px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79] ${
                        isSelected
                          ? "bg-[#fbe7b8] text-[#3b3226] dark:bg-[#e5be79] dark:text-[#231b12]"
                          : isDue
                            ? "bg-[#f4d9ba] text-[#6f4b1d] dark:bg-[#523b1c] dark:text-[#f7deb0]"
                            : "text-[#4a3f30] hover:bg-white/70 dark:text-[#f0e4ce] dark:hover:bg-white/8"
                      }`}
                    >
                      {date.getDate()}
                      {isDue ? (
                        <Heart
                          size={10}
                          fill="currentColor"
                          className={`absolute bottom-0.5 ${
                            isSelected ? "text-[#6f5a35] dark:text-[#231b12]" : "text-[#b98a3e] dark:text-[#e5be79]"
                          }`}
                          aria-hidden="true"
                        />
                      ) : count > 0 ? (
                        <span
                          className={`absolute bottom-1 h-1 w-1 rounded-full ${
                            isSelected ? "bg-[#6f5a35] dark:bg-[#231b12]" : "bg-[#b98a3e] dark:bg-[#e5be79]"
                          }`}
                        />
                      ) : isToday && !isSelected ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#9b8a6f] dark:bg-[#b9a88e]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#e8d9bd] pt-4 text-[12px] text-[#6f6149] dark:border-[#3d3123] dark:text-[#b9a88e]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#b98a3e] dark:bg-[#e5be79]" /> {t("calendar.taskOrEvent")}
                </span>
                <span className="flex items-center gap-2">
                  <Heart size={13} className="text-[#b98a3e] dark:text-[#e5be79]" /> {t("calendar.dueDate")}
                </span>
              </div>
            </section>

            <section id="selected-day-agenda" aria-label={t("calendar.yourDayAtGlance")} className="px-1 pt-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0" aria-live="polite" aria-atomic="true">
                  <h2
                    id="selected-day-title"
                    className="text-[20px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
                  >
                    {dayTitle(selected, isAmharic)}
                  </h2>
                  <p className="mt-1 text-[12px] text-[#6f6149] dark:text-[#b9a88e]">
                    {selectedItems.length === 0
                      ? t("calendar.yourDayAtGlance")
                      : selectedItems.length === 1
                        ? t("calendar.taskCountSingle")
                        : t("calendar.tasksCount", { count: selectedItems.length })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditor({ key: `new-${Date.now()}`, item: null })}
                  aria-label={t("calendar.addEvent")}
                  aria-describedby="selected-day-title"
                  aria-haspopup="dialog"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a35d]/35 bg-[#fbe7b8]/55 text-[#6f5a35] backdrop-blur-md transition-colors hover:bg-[#fbe7b8]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] motion-reduce:transition-none dark:border-[#e5be79]/35 dark:bg-[#e5be79]/16 dark:text-[#e5be79] dark:hover:bg-[#e5be79]/26 dark:focus-visible:outline-[#e5be79]"
                >
                  <Plus size={21} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
              <div
                key={dateKey(selected)}
                className="mt-3 motion-safe:animate-[food-expand_0.25s_ease-out_both]"
              >
                {dateKey(selected) === dueDate && (
                  <p className="mb-2 flex items-center gap-2 py-2 text-[14px] font-medium text-[#8d6a2a] dark:text-[#e5be79]">
                    <Heart size={16} aria-hidden="true" /> {t("calendar.estimatedDueDate")}
                  </p>
                )}
                {selectedItems.length > 0 ? (
                  <AgendaItems items={selectedItems} onEdit={editItem} />
                ) : (
                  <p className="py-4 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("calendar.nothingPlannedDay")}
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-5">
            <section
              aria-label={t("calendar.dueDate")}
              data-dashboard-card
              className="home-glass-gold rounded-[26px] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-[#8d6a2a] dark:text-[#e5be79]">
                    {t("calendar.lookForward")}
                  </p>
                  <h2 className="mt-2 text-[24px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {due.toLocaleDateString(isAmharic ? "am-ET" : "en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#6f6149] dark:text-[#d8c7ab]">
                    {t("calendar.estimatedDueDate")} · {dueText}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/65 text-[#a87a3d] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                  <Heart size={21} strokeWidth={1.7} />
                </span>
              </div>
              {editingDueDate ? (
                <form
                  className="mt-4 flex flex-wrap items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (dueDraft) {
                      setDueDate(dueDraft);
                      setEditingDueDate(false);
                      setMessage(t("calendar.dueDateUpdated"));
                    }
                  }}
                >
                  <label className="flex-1 text-[12px] text-[#6f6149] dark:text-[#d8c7ab]">
                    {t("calendar.estimatedDueDate")}
                    <input
                      type="date"
                      required
                      value={dueDraft}
                      onChange={(event) => setDueDraft(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#d8c6a4] bg-white px-3 py-2.5 text-[14px] text-[#3b3226] outline-none focus:border-[#a87a3d] dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-[#4a3f30] px-4 py-2.5 text-[13px] font-medium text-white dark:bg-[#e5be79] dark:text-[#231b12]"
                  >
                    {t("common.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDueDate(false)}
                    className="rounded-full px-2 py-2.5 text-[13px] text-[#6f6149] dark:text-[#d8c7ab]"
                  >
                    {t("common.cancel")}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDueDraft(dueDate);
                    setEditingDueDate(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6f5a35] underline decoration-[#b98a3e]/70 underline-offset-4 dark:text-[#e5be79]"
                >
                  <Pencil size={14} /> {t("calendar.updateDueDate")}
                </button>
              )}
            </section>

            <section aria-label={t("calendar.thisWeek")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("calendar.thisWeek")}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
                    {weekLabel(selectedWeek, isAmharic)}
                  </p>
                </div>
              </div>

              <div className="mt-3 divide-y divide-[#dccbaa]/65 dark:divide-[#3d3123]">
                {plannedDays.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-[14px] font-medium text-[#4a3f30] dark:text-[#f0e4ce]">
                      {t("calendar.nothingPlannedWeek")}
                    </p>
                    <p className="mt-1 text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                      {t("calendar.chooseDayPrompt")}
                    </p>
                  </div>
                )}
                {plannedDays.map((date) => {
                  const key = dateKey(date);
                  const dayItems = items
                    .filter((item) => item.date === key)
                    .sort((a, b) => a.time.localeCompare(b.time));
                  const isDue = key === dueDate;
                  return (
                    <div key={key} className="py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`text-[13px] font-medium ${
                            key === dateKey(selected)
                              ? "text-[#8d6a2a] dark:text-[#e5be79]"
                              : "text-[#6f6149] dark:text-[#b9a88e]"
                          }`}
                        >
                          {dayTitle(date, isAmharic)}
                          {key === dateKey(today) ? ` · ${t("calendar.today")}` : ""}
                        </p>
                        {dayItems.length > 0 && (
                          <span className="text-[11px] text-[#9b8a6f] dark:text-[#9c8b72]">
                            {dayItems.length === 1
                              ? t("calendar.taskCountSingle")
                              : t("calendar.tasksCount", { count: dayItems.length })}
                          </span>
                        )}
                      </div>
                      {isDue && (
                        <p className="mt-2 flex items-center gap-2 text-[13px] text-[#8d6a2a] dark:text-[#e5be79]">
                          <Heart size={15} /> {t("calendar.estimatedDueDate")}
                        </p>
                      )}
                      {dayItems.length > 0 ? (
                        <div className="mt-1.5">
                          <AgendaItems items={dayItems} onEdit={editItem} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav current="calendar" />
      {message && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-40 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full bg-[#3b3226] px-5 py-3 text-center text-[13px] font-medium text-[#fffaf0] shadow-lg dark:bg-[#e5be79] dark:text-[#231b12]"
        >
          {message}
        </div>
      )}
      {editor && (
        <ItemEditor
          key={editor.key}
          initial={editor.item}
          selectedDate={dateKey(selected)}
          onClose={() => setEditor(null)}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
}
