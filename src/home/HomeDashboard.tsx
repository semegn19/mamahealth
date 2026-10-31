"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "../settings/profileStore";
import { useNotifications } from "../notifications/notificationsData";
import { ShareReportDialog } from "../report/ShareReportDialog";
import { REPORT_ARCHIVE } from "../report/reportCatalog";
import { QuickLogDialog } from "../logs/QuickLogDialog";

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

/** A small, predictable agenda so the calendar feels alive in the prototype. */
function agendaFor(date: Date) {
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

export function HomeTopBar({ now = new Date() }: { now?: Date }) {
  const router = useRouter();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => {
          router.push("/settings");
        }}
        aria-label="Open settings"
        className="flex items-center gap-3 rounded-full text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
      >
        <img
          src="/images/avatar.jpg"
          alt=""
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-[#e5be79]/35"
        />
        <div>
          <p className="text-[13px] text-[#85735a] dark:text-[#9c8b72]">{greeting(now)}</p>
          <p className="text-[17px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
            {profile.name}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-2.5">
        <LanguageSwitcher />
        <RoundIconButton
          label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          dot={unreadCount > 0}
          onClick={() => {
            router.push("/notifications");
          }}
        >
          <Bell size={19} strokeWidth={1.8} />
        </RoundIconButton>
      </div>
    </div>
  );
}

function TopSection({ now }: { now: Date }) {
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
              Second trimester
            </span>
            <h2 className="mt-3 text-[26px] font-medium leading-[1.12] tracking-[-0.02em] text-[#3b3226] dark:text-[#f5ede0]">
              Your Weekly
              <br />
              Progress
            </h2>
            <p className="mt-2 text-[13px] text-[#6f5a35] dark:text-[#d8c7ab]">
              Baby is the size of an ear of corn
            </p>
          </div>
          <ProgressRing value={24} max={40} label="weeks" />
        </div>
      </div>
    </section>
  );
}

function StatsSection({ now }: { now: Date }) {
  const router = useRouter();
  const day = WEEKDAY_SHORT[now.getDay()];
  const [shareOpen, setShareOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const latestReport = REPORT_ARCHIVE[0];

  const journey = [
    { value: "4", unit: "symptoms" },
    { value: "3", unit: "food groups" },
    { value: "2", unit: "supplements taken" },
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
                <p className="text-[11px] font-medium uppercase tracking-[0.14em]">Journey</p>
                <p className="mt-1 text-[11px] text-[#fff3dc]/80">Today, {day}</p>
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
              Share latest report
            </p>
          </button>
        </div>

        {/* RIGHT — two pill cards: the two ways to check in */}
        <div className="flex flex-col gap-3">
          {/* Primary action: voice check-in (slightly larger, stronger edge) */}
          <button
            type="button"
            data-dashboard-card
            onClick={() => {
              router.push("/voice");
            }}
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
              Start your voice check-in
            </p>
            <p className="mt-1 text-[11.5px] tracking-[0.08em] text-[#85735a] dark:text-[#9c8b72]">
              ABOUT 1 MIN
            </p>
          </button>

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
              Log by hand
            </p>
            <p className="mt-0.5 text-[11px] tracking-[0.08em] text-[#85735a] dark:text-[#9c8b72]">
              YOUR OWN PACE
            </p>
          </button>
        </div>
      </section>

      <ShareReportDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        reportId={latestReport.id}
        appointment={latestReport.appointment}
      />

      <QuickLogDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  );
}

function CalendarSection({ now }: { now: Date }) {
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

  const heading = days[3].toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const agenda = agendaFor(selected);

  return (
    <section
      id="home-calendar"
      data-dashboard-card
      aria-label="Calendar"
      className="home-glass rounded-[28px] p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[19px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
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
                {DAY_LETTERS[i]}
              </span>
              <span
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
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#d9ab5e]" />
        {agenda ? (
          <p className="text-[13.5px] text-[#4a3f30] dark:text-[#f0e4ce]">
            {agenda.title}
            <span className="text-[#9b8a6f] dark:text-[#9c8b72]"> · {agenda.time}</span>
          </p>
        ) : (
          <p className="text-[13.5px] text-[#85735a] dark:text-[#9c8b72]">
            No appointments. A good day to rest.
          </p>
        )}
      </div>
    </section>
  );
}

export type NavKey = "home" | "calendar" | "report" | "checkin";

export function BottomNav({ current = "home" }: { current?: NavKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<NavKey>(current);

  useEffect(() => {
    setActive(current);
  }, [current]);

  const [overCards, setOverCards] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const measureOverlap = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pill = pillRef.current;
        if (!pill) return;

        const navRect = pill.getBoundingClientRect();
        const cards = document.querySelectorAll<HTMLElement>("[data-dashboard-card]");
        const overlaps = Array.from(cards).some((card) => {
          const cardRect = card.getBoundingClientRect();
          return (
            navRect.left < cardRect.right &&
            navRect.right > cardRect.left &&
            navRect.top < cardRect.bottom &&
            navRect.bottom > cardRect.top
          );
        });

        setOverCards(overlaps);
      });
    };

    measureOverlap();
    window.addEventListener("scroll", measureOverlap, { passive: true });
    window.addEventListener("resize", measureOverlap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", measureOverlap);
      window.removeEventListener("resize", measureOverlap);
    };
  }, []);

  const item = (key: NavKey, label: string, icon: React.ReactNode, onClick?: () => void) => {
    const isActive = active === key;
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          setActive(key);
          onClick?.();
        }}
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
          isActive
            ? "bg-[#c9a35d] text-[#2c2010] shadow-[0_10px_22px_-12px_rgba(140,96,30,0.75)] dark:bg-[#8d6a2a] dark:text-[#fdf2da] dark:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.85)]"
            : "bg-white/45 text-[#4a3f30] hover:bg-white/70 dark:bg-white/8 dark:text-[#e6dbca] dark:hover:bg-white/14"
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <div
        ref={pillRef}
        className={`flex items-center gap-2.5 rounded-full p-2 transition-[background-color,border-color,box-shadow] duration-300 ${
          overCards ? "home-nav-overlap" : "home-nav-clear"
        }`}
      >
        {item("home", "Home", <Home size={19} strokeWidth={1.9} />, () => {
          if (pathname === "/home") window.scrollTo({ top: 0, behavior: "smooth" });
          else router.push("/home");
        })}
        {item("calendar", "Calendar", <CalendarDays size={19} strokeWidth={1.8} />, () => {
          router.push("/calendar");
        })}

        {/* Voice assistant */}
        <button
          type="button"
          aria-label="Start voice check-in"
          onClick={() => {
            router.push("/voice");
          }}
          className="relative mx-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] shadow-[0_10px_24px_-10px_rgba(60,45,25,0.7)] transition active:scale-95 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_10px_26px_-8px_rgba(229,190,121,0.45)]"
        >
          <Mic size={24} strokeWidth={1.9} className="relative" />
        </button>

        {item("report", "ANC report", <FileText size={19} strokeWidth={1.8} />, () => {
          router.push("/reports");
        })}
        {item("checkin", "Check-in logs", <ListChecks size={19} strokeWidth={1.8} />, () => {
          router.push("/logs");
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HomeDashboard() {
  const now = useMemo(() => new Date(), []);

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
            <TopSection now={now} />
          </div>
          <StatsSection now={now} />
          <CalendarSection now={now} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
