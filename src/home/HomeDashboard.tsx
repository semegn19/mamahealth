"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  FileText,
  Home,
  ListChecks,
  Mic,
  PenLine,
  Route,
  Share2,
  Sparkles,
} from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { BottomNav, type NavKey } from "../components/BottomNav";
import { HomeTopBar } from "../components/HomeTopBar";
import { useTranslation } from "../components/languageStore";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "../settings/profileStore";
import { useNotifications } from "../notifications/notificationsData";
import { ShareReportDialog } from "../report/ShareReportDialog";
import {
  REPORT_ARCHIVE,
  backendSummaryToArchiveItem,
  type ReportArchiveItem,
} from "../report/reportCatalog";
import { QuickLogDialog } from "../logs/QuickLogDialog";
import { mockAgendaFor as agendaFor } from "../mock/calendar";
import {
  ancApi,
  reportsApi,
  usersApi,
  type CurrentPregnancyStatus,
  type UserAppointment,
  type WHOANCContact,
} from "../api";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function greeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function RoundIconButton({
  label,
  children,
  dot = false,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  dot?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="home-icon-solid relative flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
    >
      {children}
      {dot && (
        <span className="absolute right-[13px] top-[12px] h-2 w-2 rounded-full bg-[#d9ab5e] ring-2 ring-white dark:ring-[#261f18]" />
      )}
    </button>
  );
}

function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShown(value / max), 150);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={r}
          strokeWidth="10"
          className="fill-[#fffaf0] stroke-[#fff3dc] dark:fill-[#221b14] dark:stroke-[#382d20]"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#ring-gold)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9bd78" />
            <stop offset="100%" stopColor="#b98a3e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-normal leading-none text-[#4a3f30] dark:text-[#f5ede0]">
          {value}
        </span>
        <span className="mt-1 text-[12px] text-[#85735a] dark:text-[#b9a88e]">{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export { BottomNav, HomeTopBar };
export type { NavKey };

function TopSection({ now, pregnancy }: { now: Date; pregnancy?: CurrentPregnancyStatus | null }) {
  const { t } = useTranslation();

  const currentWeek = pregnancy?.gestational_age_weeks ?? 24;
  const trimesterKey = pregnancy?.trimester;
  const getTrimesterLabel = () => {
    if (trimesterKey === "first_trimester") {
      const label = t("home.firstTrimester");
      return label === "home.firstTrimester" ? "First trimester" : label;
    }
    if (trimesterKey === "third_trimester") {
      const label = t("home.thirdTrimester");
      return label === "home.thirdTrimester" ? "Third trimester" : label;
    }
    const label = t("home.secondTrimester");
    return label === "home.secondTrimester" ? "Second trimester" : label;
  };
  const trimesterLabel = getTrimesterLabel();

  return (
    <section aria-label="Overview" className="space-y-4">
      {/* Greeting */}
      <HomeTopBar now={now} />

      {/* Weekly progress */}
      <div data-dashboard-card className="home-glass-gold relative overflow-hidden rounded-[28px] p-5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/45 blur-2xl dark:bg-[#e5be79]/12" />
        <div className="pointer-events-none absolute -bottom-16 left-[22%] h-32 w-40 rounded-full bg-[#d9ab5e]/25 blur-3xl dark:bg-[#d9ab5e]/15" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] text-[#6f5a35] dark:text-[#e5be79]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 dark:bg-[#e5be79]/18">
                <Sparkles size={14} strokeWidth={1.8} />
              </span>
              {trimesterLabel}
            </span>
            <h2 className="mt-3 text-[26px] font-medium leading-[1.12] tracking-[-0.02em] text-[#3b3226] dark:text-[#f5ede0]">
              {t("home.progressTitle")}
            </h2>
            <p className="mt-2 text-[13px] text-[#6f5a35] dark:text-[#d8c7ab]">
              {t("home.babySize")}
            </p>
          </div>
          <ProgressRing value={currentWeek} max={40} label={t("home.weeks")} />
        </div>
      </div>
    </section>
  );
}

function StatsSection({
  now,
  latestReport,
}: {
  now: Date;
  latestReport?: ReportArchiveItem | null;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const day = WEEKDAY_SHORT[now.getDay()];
  const [shareOpen, setShareOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const reportToShare = latestReport || REPORT_ARCHIVE[0];

  const journey = [
    { value: "4", unit: t("home.symptoms") },
    { value: "3", unit: t("home.foodGroups") },
    { value: "2", unit: t("home.supplementsTaken") },
  ];

  return (
    <>
      <section aria-label="Today's check-in" className="grid grid-cols-[1.05fr_1fr] gap-3">
        {/* LEFT — journey + share report */}
        <div className="flex flex-col gap-3">
          {/* Compact journey card */}
          <article data-dashboard-card className="home-glass-bronze rounded-[26px] p-5 text-[#fffaf0]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em]">{t("home.journey")}</p>
                <p className="mt-1 text-[11px] text-[#fff3dc]/80">{t("home.today")}, {day}</p>
              </div>
              <Route size={17} strokeWidth={1.7} />
            </div>
            <dl className="mt-3.5 space-y-1.5">
              {journey.map(({ value, unit }) => (
                <div key={unit} className="flex items-baseline gap-1">
                  <dd className="text-[26px] font-light leading-none tracking-[-0.02em]">{value}</dd>
                  <dt className="text-[11px] font-medium leading-tight">{unit}</dt>
                </div>
              ))}
            </dl>
          </article>

          {/* Share latest report card — same structure as the cards on the right */}
          <button
            type="button"
            data-dashboard-card
            onClick={() => setShareOpen(true)}
            aria-haspopup="dialog"
            className="home-card-solid group flex flex-1 flex-col justify-center rounded-[32px] px-5 py-4 text-left transition hover:border-[#c9a35d]/70 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:hover:border-[#e5be79]/55 dark:focus-visible:outline-[#e5be79]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbe7b8] text-[#6f5a35] transition group-hover:scale-105 dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                <Share2 size={16} strokeWidth={1.8} />
              </span>
              <ArrowUpRight
                size={18}
                strokeWidth={1.7}
                className="text-[#b98a3e] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-[#e5be79]"
              />
            </div>
            <p className="mt-2.5 text-[15px] font-medium leading-snug tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              {t("home.shareReport")}
            </p>
          </button>
        </div>

        {/* RIGHT — two pill cards: the two ways to check in */}
        <div className="flex flex-col gap-3">
          {/* Primary action: voice check-in (slightly larger, stronger edge) */}
          <Link
            href="/voice"
            prefetch={true}
            data-dashboard-card
            className="home-card-solid group flex flex-col justify-center rounded-[30px] px-5 py-5 text-left ring-1 ring-[#c9a35d]/45 transition hover:ring-[#c9a35d]/80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:ring-[#e5be79]/35 dark:hover:ring-[#e5be79]/70 dark:focus-visible:outline-[#e5be79]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] transition group-hover:scale-105 dark:bg-[#e5be79] dark:text-[#231b12]">
                <Mic size={20} strokeWidth={1.9} />
              </span>
              <ArrowUpRight
                size={20}
                strokeWidth={1.7}
                className="text-[#b98a3e] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-[#e5be79]"
              />
            </div>
            <p className="mt-3.5 text-[16.5px] font-medium leading-snug tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              {t("home.startVoice")}
            </p>
            <p className="mt-1 text-[11.5px] tracking-[0.08em] text-[#85735a] dark:text-[#9c8b72]">
              {t("home.aboutOneMin")}
            </p>
          </Link>

          {/* Secondary action: log by hand (compact) */}
          <button
            type="button"
            data-dashboard-card
            onClick={() => setLogOpen(true)}
            aria-haspopup="dialog"
            className="home-card-solid group flex flex-1 flex-col justify-center rounded-[26px] px-4 py-2 text-left transition hover:border-[#c9a35d]/70 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:hover:border-[#e5be79]/55 dark:focus-visible:outline-[#e5be79]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbe7b8] text-[#6f5a35] transition group-hover:scale-105 dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                <PenLine size={18} strokeWidth={1.8} />
              </span>
              <ArrowUpRight
                size={17}
                strokeWidth={1.7}
                className="text-[#b98a3e] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-[#e5be79]"
              />
            </div>
            <p className="mt-2 text-[15px] font-medium leading-snug tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
              {t("home.logByHand")}
            </p>
            <p className="mt-0.5 text-[11px] tracking-[0.08em] text-[#85735a] dark:text-[#9c8b72]">
              {t("home.quickFoodSupplements")}
            </p>
          </button>
        </div>
      </section>

      <ShareReportDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        reportId={reportToShare.id}
        appointment={reportToShare.appointment}
      />

      <QuickLogDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  );
}

function CalendarSection({
  now,
  appointment,
  nextAnc,
}: {
  now: Date;
  appointment?: UserAppointment | null;
  nextAnc?: WHOANCContact | null;
}) {
  const { t, isAmharic } = useTranslation();
  const dayLetters = useMemo(
    () => (isAmharic ? ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"] : ["S", "M", "T", "W", "T", "F", "S"]),
    [isAmharic],
  );

  const [weekStart, setWeekStart] = useState(() => startOfWeek(now));
  const [selected, setSelected] = useState(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const shift = (dir: -1 | 1) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + dir * 7);
    setWeekStart(next);
    const sel = new Date(selected);
    sel.setDate(selected.getDate() + dir * 7);
    setSelected(sel);
  };

  const heading = days[3].toLocaleDateString(isAmharic ? "am-ET" : "en-US", { month: "long", year: "numeric" });
  
  const agenda = useMemo(() => {
    // 1. Check if selected matches clinical ANC appointment
    if (appointment?.appointment_date) {
      const [y, m, d] = appointment.appointment_date.split("-").map(Number);
      if (
        selected.getFullYear() === y &&
        selected.getMonth() === m - 1 &&
        selected.getDate() === d
      ) {
        return {
          title: isAmharic
            ? appointment.anc_contact_title_am || appointment.anc_contact_title || "የቅድመ ወሊድ ክትትል"
            : appointment.anc_contact_title || "ANC Clinical Contact",
          time: "09:30",
          isAnc: true,
        };
      }
    } else if (nextAnc?.target_date) {
      const [y, m, d] = nextAnc.target_date.split("-").map(Number);
      if (
        selected.getFullYear() === y &&
        selected.getMonth() === m - 1 &&
        selected.getDate() === d
      ) {
        return {
          title: isAmharic ? nextAnc.title_am : nextAnc.title_en,
          time: "09:30",
          isAnc: true,
        };
      }
    }

    // 2. Check saved user calendar items for selected day
    try {
      const saved = localStorage.getItem("mama-health-calendar-items-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        const selKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
        const match = Array.isArray(parsed) ? parsed.find((it: any) => it.date === selKey) : null;
        if (match) {
          return {
            title: isAmharic ? match.title_am || match.title : match.title,
            time: match.time || "09:00",
            isAnc: false,
          };
        }
      }
    } catch {}

    // 3. Fallback standard schedule
    switch (selected.getDay()) {
      case 1:
        return { title: t("home.agendaMorning"), time: "08:00", isAnc: false };
      case 3:
        return { title: t("home.agendaMidwife"), time: "10:30", isAnc: false };
      case 5:
        return { title: t("home.agendaGlucose"), time: "09:15", isAnc: false };
      case 6:
        return { title: t("home.agendaYoga"), time: "18:00", isAnc: false };
      default:
        return null;
    }
  }, [selected, appointment, nextAnc, isAmharic, t]);

  return (
    <section
      id="home-calendar"
      data-dashboard-card
      aria-label="Calendar"
      className="home-glass rounded-[28px] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 suppressHydrationWarning className="text-[19px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
          {heading}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous week"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ecdb] text-[#6f6149] transition hover:bg-[#efe2c8] active:scale-95 dark:bg-[#2d241b] dark:text-[#d8c7ab] dark:hover:bg-[#382d22]"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next week"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ecdb] text-[#6f6149] transition hover:bg-[#efe2c8] active:scale-95 dark:bg-[#2d241b] dark:text-[#d8c7ab] dark:hover:bg-[#382d22]"
          >
            <ArrowRight size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isSel = sameDay(d, selected);
          const isToday = sameDay(d, now);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={isSel}
              aria-label={d.toDateString()}
              className={`relative flex flex-col items-center gap-1.5 rounded-full py-2.5 transition-colors duration-300 ${
                isSel
                  ? "bg-[#fbe7b8] dark:bg-[#e5be79]"
                  : "hover:bg-[#faf3e6] dark:hover:bg-white/6"
              }`}
            >
              <span
                className={`text-[12px] ${
                  isSel
                    ? "text-[#6f5a35] dark:text-[#231b12]"
                    : "text-[#9b8a6f] dark:text-[#9c8b72]"
                }`}
              >
                {dayLetters[i]}
              </span>
              <span
                suppressHydrationWarning
                className={`text-[16px] font-semibold ${
                  isSel
                    ? "text-[#3b3226] dark:text-[#231b12]"
                    : "text-[#3b3226] dark:text-[#f5ede0]"
                }`}
              >
                {String(d.getDate()).padStart(2, "0")}
              </span>
              {isToday && !isSel && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d9ab5e]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/55 bg-white/35 px-4 py-3 backdrop-blur-md dark:border-[#e5be79]/16 dark:bg-[#1a1510]/65">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            agenda?.isAnc ? "bg-[#b74835] dark:bg-[#e4725c]" : "bg-[#d9ab5e]"
          }`}
        />
        {agenda ? (
          <p className="text-[13.5px] text-[#4a3f30] dark:text-[#f0e4ce]">
            <span className={agenda.isAnc ? "font-semibold text-[#8d2d1f] dark:text-[#f08b75]" : ""}>
              {agenda.title}
            </span>
            <span className="text-[#9b8a6f] dark:text-[#9c8b72]"> · {agenda.time}</span>
          </p>
        ) : (
          <p className="text-[13.5px] text-[#85735a] dark:text-[#9c8b72]">
            {t("home.noAppointments")}
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HomeDashboard() {
  const now = useMemo(() => new Date(), []);
  const [pregnancy, setPregnancy] = useState<CurrentPregnancyStatus | null>(null);
  const [appointment, setAppointment] = useState<UserAppointment | null>(null);
  const [nextAnc, setNextAnc] = useState<WHOANCContact | null>(null);
  const [latestReport, setLatestReport] = useState<ReportArchiveItem | null>(null);

  useEffect(() => {
    let active = true;

    usersApi
      .getMe()
      .then((me) => {
        if (!active) return;
        if (me.current_pregnancy_status) {
          setPregnancy(me.current_pregnancy_status);
        }
        if (me.appointment) {
          setAppointment(me.appointment);
        }
      })
      .catch(() => {});

    ancApi
      .getAncSchedule()
      .then((sched) => {
        if (!active) return;
        if (sched.next_anc_contact) {
          setNextAnc(sched.next_anc_contact);
        }
      })
      .catch(() => {});

    reportsApi
      .getLatestSummary()
      .then((summary) => {
        if (!active) return;
        if (summary && summary.id) {
          setLatestReport(backendSummaryToArchiveItem(summary));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      {/* Soft ambient glow, same family as the landing page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[18%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-35 blur-[100px] dark:bg-[#9c6d27] dark:opacity-15" />
        <div className="absolute -left-28 top-[48%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-55 blur-[95px] dark:bg-[#6e4c1b] dark:opacity-16" />
        <div className="absolute -right-20 bottom-[4%] h-[280px] w-[280px] rounded-full bg-white opacity-65 blur-[90px] dark:bg-[#8d6224] dark:opacity-12" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[960px] md:px-8">
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
          <div className="md:col-span-2">
            <TopSection now={now} pregnancy={pregnancy} />
          </div>
          <StatsSection now={now} latestReport={latestReport} />
          <CalendarSection
            now={now}
            appointment={appointment}
            nextAnc={nextAnc}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
