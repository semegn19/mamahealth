"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Baby,
  CalendarDays,
  Check,
  ChevronLeft,
  Heart,
  Info,
  MapPin,
  Mic,
  Minus,
  Pill,
  Plus,
  X,
} from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import { ThemeSelect } from "../components/ThemeSelect";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTranslation } from "../components/languageStore";
import {
  COMPLICATION_OPTIONS,
  CONDITION_OPTIONS,
  daysInEthiopianMonth,
  daysInGregorianMonth,
  ETHIOPIAN_MONTHS,
  formatEthiopian,
  formatGregorian,
  GREGORIAN_MONTHS,
  SUPPLEMENT_CHOICE_OPTIONS,
  gestationFromKnown,
  gestationFromLmp,
  loadOnboarding,
  lmpToGregorian,
  saveOnboarding,
  type CalendarSystem,
  EMPTY_ONBOARDING,
  type DatingMode,
  type OnboardingData,
  type Residence,
} from "./onboardingStore";
import { useRouter } from "next/navigation";

type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Screen = "welcome" | Stage | "complete";

const TOTAL_STEPS: Stage = 7;

const ETHIOPIAN_MONTHS_AM = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
];

const GREGORIAN_MONTHS_AM = [
  "ጃንዋሪ",
  "ፌብሩዋሪ",
  "ማርች",
  "ኤፕሪል",
  "ሜይ",
  "ጁን",
  "ጁላይ",
  "ኦገስት",
  "ሴፕቴምበር",
  "ኦክቶበር",
  "ኖቬምበር",
  "ዲሴምበር",
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function NumberStepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="block text-[15px] font-medium text-[#3b3226] dark:text-[#f5ede0]"
          >
            {label}
          </label>
          {hint && (
            <p className="mt-0.5 text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">{hint}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= min}
            aria-label={`Decrease ${label.toLowerCase()}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c6a4] bg-white/85 text-[#6f5a35] transition enabled:hover:bg-[#fbe7b8] disabled:opacity-40 dark:border-[#4a3c2c] dark:bg-[#231c15] dark:text-[#e5be79] dark:enabled:hover:bg-[#2f251b]"
          >
            <Minus size={16} strokeWidth={2.2} />
          </button>
          <span className="min-w-[1.75rem] text-center text-[22px] font-medium tabular-nums text-[#3b3226] dark:text-[#f5ede0]">
            {value}
          </span>
          <input id={id} type="hidden" value={value} />
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            aria-label={`Increase ${label.toLowerCase()}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c6a4] bg-white/85 text-[#6f5a35] transition enabled:hover:bg-[#fbe7b8] disabled:opacity-40 dark:border-[#4a3c2c] dark:bg-[#231c15] dark:text-[#e5be79] dark:enabled:hover:bg-[#2f251b]"
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentedSwitch<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const activeIndex = options.findIndex((option) => option.value === value);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  return (
    <div
      role="group"
      aria-label={label}
      className="relative flex rounded-full border border-[#d8c6a4]/80 bg-[#e7dcc7]/60 p-1 backdrop-blur-md dark:border-[#46392a] dark:bg-[#1e1812]/85"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#4a3f30] shadow-sm transition-all duration-300 ease-out dark:bg-[#e5be79]"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(safeIndex * 100) / options.length}% + 2px)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 min-h-11 flex-1 rounded-full px-3 text-[13.5px] font-medium transition-colors duration-200 ${
            value === option.value
              ? "text-[#fffaf0] dark:text-[#231b12]"
              : "text-[#6f6149] hover:text-[#3b3226] dark:text-[#b9a88e] dark:hover:text-[#f5ede0]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* Yes / No question rendered as two option buttons. */
function YesNoQuestion({
  id,
  question,
  value,
  onChange,
  error,
  hideLabel = false,
}: {
  id: string;
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
  hideLabel?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p
        id={id}
        className={
          hideLabel ? "sr-only" : "text-[15px] font-medium text-[#3b3226] dark:text-[#f5ede0]"
        }
      >
        {question}
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5" role="group" aria-labelledby={id}>
        {[
          { label: t("common.yes"), value: true },
          { label: t("common.no"), value: false },
        ].map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-[14.5px] font-medium transition-all duration-200 ${
                active
                  ? "border-[#4a3f30] bg-[#4a3f30] text-[#fffaf0] shadow-[0_8px_20px_-10px_rgba(60,45,25,0.6)] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                  : "border-[#d8c6a4] bg-white/80 text-[#6f6149] hover:border-[#c9a35d] hover:bg-white dark:border-[#4a3c2c] dark:bg-[#231c15]/85 dark:text-[#c7b69c] dark:hover:border-[#e5be79]/55 dark:hover:bg-[#2c231a]"
              }`}
            >
              {active && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
          {error}
        </p>
      )}
    </div>
  );
}

/* One selectable row in a multi-select choice list. */
function ChoiceRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-[#c9a35d] bg-[#fbe7b8]/70 shadow-[0_6px_16px_-10px_rgba(160,120,50,0.5)] dark:border-[#e5be79] dark:bg-[#e5be79]/18"
          : "border-[#d8c6a4] bg-white/70 hover:border-[#c9a35d]/70 hover:bg-white dark:border-[#3d3123] dark:bg-[#221c15]/80 dark:hover:border-[#e5be79]/45 dark:hover:bg-[#2a221a]"
      }`}
    >
      <span className="text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          selected
            ? "border-[#4a3f30] bg-[#4a3f30] text-[#fbe7b8] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
            : "border-[#c9b489] dark:border-[#574734]"
        }`}
      >
        {selected && <Check size={13} strokeWidth={3} />}
      </span>
    </button>
  );
}

/* Text input with an inline Add button (custom conditions, medications). */
function AddField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onAdd,
  addLabel,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  addLabel?: string;
}) {
  const { t } = useTranslation();
  const resolvedAddLabel = addLabel || (t("common.save") !== "common.save" ? t("common.save") : "Add");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onAdd();
      }}
    >
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]"
      >
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={60}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[#d8c6a4] bg-white/85 px-4 py-3 text-[14.5px] text-[#3b3226] outline-none transition-colors placeholder:text-[#a99b84] focus:border-[#a87a3d] focus:bg-white dark:border-[#4a3c2c] dark:bg-[#221c15]/85 dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79] dark:focus:bg-[#282018]"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-full bg-[#4a3f30] px-5 text-[14px] font-medium text-[#fffaf0] transition enabled:hover:bg-[#655039] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#e5be79] dark:text-[#231b12] dark:enabled:hover:bg-[#f0cf92]"
        >
          <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
          {resolvedAddLabel}
        </button>
      </div>
    </form>
  );
}

function DateSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  selectLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  selectLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-[12px] font-medium text-[#6f6149] dark:text-[#b9a88e]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`mt-1.5 min-h-12 w-full appearance-none rounded-2xl border bg-white/90 px-3 py-2.5 text-[14px] text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] dark:bg-[#221c15]/85 dark:text-[#f5ede0] dark:focus:border-[#e5be79] ${
          error
            ? "border-[#9c3a29]/70 dark:border-[#e4725c]/70"
            : "border-[#d8c6a4] dark:border-[#4a3c2c]"
        } ${value ? "" : "text-[#a99b84] dark:text-[#7d6e58]"}`}
      >
        <option value="">{selectLabel || t("onboarding.select")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mic permission stage                                                 */
/* ------------------------------------------------------------------ */

/** Concentric gold ripples expanding from a mic badge. */
function MicRings() {
  return (
    <div className="relative flex h-[260px] w-[260px] items-center justify-center">
      {[0, 1, 2].map((ring) => (
        <span
          key={ring}
          aria-hidden="true"
          className="absolute rounded-full border border-[#c9a35d]/45 dark:border-[#e5be79]/35"
          style={{
            inset: `${ring * 34}px`,
            animation: `mic-ring ${3 + ring}s cubic-bezier(0.25, 0.9, 0.3, 1) ${ring * 0.7}s infinite`,
          }}
        />
      ))}
      <span
        aria-hidden="true"
        className="absolute inset-[46px] rounded-full bg-[#fbe7b8] opacity-70 blur-3xl dark:bg-[#c99642] dark:opacity-25"
      />
      <span className="relative flex h-[128px] w-[128px] items-center justify-center rounded-full bg-gradient-to-br from-[#3b3226] to-[#4a3f30] text-[#fbe7b8] shadow-[0_22px_50px_-18px_rgba(60,45,25,0.75)] dark:from-[#efd093] dark:to-[#c99642] dark:text-[#231b12] dark:shadow-[0_22px_50px_-18px_rgba(229,190,121,0.45)]">
        <Mic size={44} strokeWidth={1.8} aria-hidden="true" />
      </span>
    </div>
  );
}

/** Live gold waveform that runs while the permission is being granted. */
function MicWaveform() {
  const heights = [28, 52, 80, 42, 66, 34, 90, 48, 24];
  return (
    <div className="flex h-16 items-center justify-center gap-1.5" aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={index}
          className="mic-wave-bar w-1.5 rounded-full bg-gradient-to-b from-[#e9bd78] to-[#b98a3e]"
          style={{
            height,
            animationDelay: `${index * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Calm completion state, shown once onboarding finishes. */
function OnboardingComplete({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="rise flex flex-col items-center justify-center text-center" role="status">
      <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#3b3226] to-[#4a3f30] text-[#fbe7b8] shadow-[0_24px_55px_-18px_rgba(60,45,25,0.75)] dark:from-[#efd093] dark:to-[#c99642] dark:text-[#231b12]">
        <Check size={46} strokeWidth={2.2} aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[#d9ab5e]/30"
        />
      </span>
      <h2 className="mt-7 text-[28px] font-light leading-[1.2] tracking-[-0.03em] text-[#3b3226] dark:text-[#f5ede0]">
        {t("onboarding.careSetUp")}
      </h2>
      <p className="mt-3 max-w-[30ch] text-[14.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
        {t("onboarding.careSetUpSub")}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function OnboardingPage() {
  const router = useRouter();
  const { t, isAmharic } = useTranslation();

  const [data, setData] = useState<OnboardingData>(EMPTY_ONBOARDING);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [stage, setStage] = useState<Stage>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [leaving, setLeaving] = useState(false);
  const [otherComplicationDraft, setOtherComplicationDraft] = useState("");
  const [showOtherComplicationField, setShowOtherComplicationField] = useState(false);
  const [otherConditionDraft, setOtherConditionDraft] = useState("");
  const [showOtherField, setShowOtherField] = useState(false);
  const [medDraft, setMedDraft] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  useEffect(() => {
    const stored = loadOnboarding();
    setData(stored);
    setScreen(stored.completed ? 1 : "welcome");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveOnboarding(data);
  }, [data, hydrated]);

  const update = (patch: Partial<OnboardingData>) => {
    setData((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const scrollTop = () => {
    const scroller = contentRef.current?.closest<HTMLElement>("[data-onboarding-scroll]");
    scroller?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goStage = (next: Stage) => {
    setLeaving(true);
    window.setTimeout(() => {
      setStage(next);
      setLeaving(false);
      scrollTop();
    }, 220);
  };

  /* ----------------------------- Dating maths ----------------------------- */

  const months = isAmharic
    ? (data.calendar === "ethiopian" ? ETHIOPIAN_MONTHS_AM : GREGORIAN_MONTHS_AM)
    : (data.calendar === "ethiopian" ? ETHIOPIAN_MONTHS : GREGORIAN_MONTHS);

  const yearFrom = data.calendar === "ethiopian" ? 2008 : 2020;
  const yearTo = data.calendar === "ethiopian" ? 2028 : 2035;
  const years = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearTo - i);

  const monthOptions = months.map((month, index) => ({
    value: String(index + 1),
    label: `${month}`,
  }));

  const lmpMaxDay = useMemo(() => {
    const year = Number(data.lmpYear);
    const month = Number(data.lmpMonth);
    if (!year || !month) return 31;
    return data.calendar === "ethiopian"
      ? daysInEthiopianMonth(year, month)
      : daysInGregorianMonth(year, month);
  }, [data.calendar, data.lmpYear, data.lmpMonth]);

  const dayOptions = Array.from({ length: lmpMaxDay }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const lmpDate = useMemo(() => {
    const day = Number(data.lmpDay);
    const month = Number(data.lmpMonth);
    const year = Number(data.lmpYear);
    if (!day || !month || !year) return null;
    if (day > (data.calendar === "ethiopian" ? daysInEthiopianMonth(year, month) : daysInGregorianMonth(year, month))) return null;
    return lmpToGregorian(data.calendar, day, month, year);
  }, [data.calendar, data.lmpDay, data.lmpMonth, data.lmpYear]);

  const knownWeeks = Number(data.knownWeeks || 0);
  const knownDays = Number(data.knownDays || 0);

  const dating = useMemo(() => {
    if (data.dating === "known") return gestationFromKnown(knownWeeks, knownDays);
    if (!lmpDate) return null;
    return gestationFromLmp(lmpDate);
  }, [data.dating, lmpDate, knownWeeks, knownDays]);

  const getOptionLabel = (option: string) => {
    const key = `onboarding.options.${option}`;
    const translated = t(key);
    return translated === key ? option : translated;
  };

  /* ----------------------------- Validation ----------------------------- */

  const validateStage1 = () => {
    const next: Record<string, string> = {};
    const age = Number(data.age);
    if (!data.age) next.age = isAmharic ? "እባክዎ ዕድሜዎን ያስገቡ።" : "Please add your age.";
    else if (!Number.isFinite(age) || age < 12 || age > 65)
      next.age = isAmharic ? "እባክዎ ዕድሜዎን በ12 እና 65 መካከል ያስገቡ።" : "Enter an age between 12 and 65.";
    if (!data.residence) next.residence = isAmharic ? "የሚኖሩበትን አካባቢ ይምረጡ።" : "Choose where you live.";
    if (data.liveBirths > data.totalPregnancies) {
      next.births = isAmharic ? "የቀጥታ ልደቶች ከጠቅላላ እርግዝና ሊበልጥ አይችልም።" : "Live births can't be more than total pregnancies.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage2 = () => {
    const next: Record<string, string> = {};
    if (data.dating === "lmp") {
      if (!data.lmpDay) next.lmp = isAmharic ? "ቀኑን ያስገቡ።" : "Add the day.";
      else if (!data.lmpMonth) next.lmp = isAmharic ? "ወሩን ያስገቡ።" : "Add the month.";
      else if (!data.lmpYear) next.lmp = isAmharic ? "ዓመቱን ያስገቡ።" : "Add the year.";
      else if (!lmpDate) next.lmp = isAmharic ? "ይህ ቀን ትክክል አይደለም — እባክዎ ያረጋግጡ።" : "That date doesn't exist — please check it.";
      else if (!dating) next.lmp = isAmharic ? "እባክዎ ቀኑን ያረጋግጡ።" : "Please check the date.";
      else if (dating.days < 0) next.lmp = isAmharic ? "የመጨረሻ የወር አበባ የመጀመሪያ ቀን ወደፊት ሊሆን አይችልም።" : "The first day of your last period can't be in the future.";
      else if (dating.days > 320) next.lmp = isAmharic ? "ያ ቀን ከ45 ሳምንታት በላይ ነው። እባክዎ ያረጋግጡ።" : "That date is more than 45 weeks ago. Check it, or use “I know the date”.";
    } else {
      if (data.knownWeeks === "") next.known = isAmharic ? "ስንት ሳምንታት እንደሆኖት ያስገቡ።" : "Add how many weeks you've been pregnant.";
      else if (knownWeeks > 42) next.known = isAmharic ? "ሳምንታት በ0 እና 42 መካከል መሆን አለበት።" : "Weeks should be between 0 and 42.";
      else if (knownDays > 6) next.known = isAmharic ? "ቀናት በ0 እና 6 መካከል መሆን አለበት።" : "Days should be between 0 and 6.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage3 = () => {
    const next: Record<string, string> = {};
    if (data.hadCesarean === null) next.cesarean = isAmharic ? "እባክዎ አዎ ወይም አይደለም ብለው ይመልሱ።" : "Please answer yes or no.";
    if (data.hadStillbirth === null) next.stillbirth = isAmharic ? "እባክዎ አዎ ወይም አይደለም ብለው ይመልሱ።" : "Please answer yes or no.";
    if (data.malariaArea === null) next.malaria = isAmharic ? "እባክዎ አዎ ወይም አይደለም ብለው ይመልሱ።" : "Please answer yes or no.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage4 = () => {
    setErrors({});
    return true;
  };

  const validateStage5 = () => {
    const next: Record<string, string> = {};
    if (data.takesMedications === null) next.meds = isAmharic ? "እባክዎ አዎ ወይም አይደለም ብለው ይመልሱ።" : "Please answer yes or no.";
    else if (data.takesMedications && data.medications.length === 0)
      next.meds = isAmharic ? "ቢያንስ አንድ መድኃኒት ይጨምሩ፣ ወይም 'አይደለም' የሚለውን ይምረጡ።" : "Add at least one medication, or choose No.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage7 = () => {
    setErrors({});
    return true;
  };

  const validateStage6 = () => {
    const next: Record<string, string> = {};
    if (data.takesSupplements === null) next.supp = isAmharic ? "እባክዎ አዎ ወይም አይደለም ብለው ይመልሱ።" : "Please answer yes or no.";
    else if (data.takesSupplements && data.supplementChoices.length === 0)
      next.supp = isAmharic ? "ቢያንስ አንድ ተጨማሪ ንጥረ ነገር ይምረጡ፣ ወይም 'አይደለም' የሚለውን ይምረጡ።" : "Select at least one supplement, or choose No.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toggleListItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];

  const tryVoiceCheckin = () => {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((track) => track.stop()))
        .catch(() => {});
    }
    finishOnboarding();
  };

  const finishOnboarding = () => {
    const finished = { ...data, completed: true };
    setData(finished);
    saveOnboarding(finished);
    setScreen("complete");
  };

  const handleContinue = () => {
    const validators = [
      validateStage1,
      validateStage2,
      validateStage3,
      validateStage4,
      validateStage5,
      validateStage6,
      validateStage7,
    ];
    if (!validators[stage - 1]()) return;
    if (stage === TOTAL_STEPS) return;
    goStage((stage + 1) as Stage);
  };

  const goBack = () => {
    if (stage > 1) {
      goStage((stage - 1) as Stage);
      return;
    }
    setScreen("welcome");
  };

  const startOnboarding = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setScreen(1);
      setStage(1);
      setLeaving(false);
      scrollTop();
    }, 260);
  };

  const dueText = dating
    ? isAmharic
      ? dating.dueDate.toLocaleDateString("am-ET", { year: "numeric", month: "long", day: "numeric" })
      : formatGregorian(dating.dueDate)
    : null;
  const dueEthiopian = dating ? formatEthiopian(dating.dueDate) : null;

  const residencePillOptions: { value: Residence; label: string }[] = [
    { value: "Rural", label: t("onboarding.rural") },
    { value: "Urban", label: t("onboarding.urban") },
  ];

  const datingModeOptions: { value: DatingMode; label: string }[] = [
    { value: "lmp", label: t("onboarding.datingLmp") },
    { value: "known", label: t("onboarding.datingKnown") },
  ];

  const calendarSystemOptions: { value: CalendarSystem; label: string; hint: string }[] = [
    { value: "gregorian", label: t("onboarding.gregorian"), hint: "G.C." },
    { value: "ethiopian", label: t("onboarding.ethiopian"), hint: "E.C." },
  ];

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-95 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[26%] h-[340px] w-[340px] rounded-full bg-[#f3d9a4] opacity-45 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-20 bottom-[-10%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-55 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <div
        data-onboarding-scroll
        className="relative mx-auto flex w-full max-w-[440px] min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6"
      >
        <header className="relative z-30 flex items-center justify-between gap-3 pt-[max(16px,env(safe-area-inset-top))]">
          {screen === "welcome" ? (
            <a
              href="#login"
              aria-label={t("common.back")}
              className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </a>
          ) : (
            <button
              type="button"
              onClick={goBack}
              aria-label={t("common.back")}
              className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </button>
          )}

          {/* Center logo or step pills */}
          {screen === "welcome" ? (
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b3226] p-1 shadow-sm dark:border dark:border-[#e5be79]/30 dark:bg-[#221c15]">
                <AppLogo className="h-full w-full" size={28} priority />
              </span>
              <span className="text-[17px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                Mama Health
              </span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2"
              aria-label={`Step ${stage} of ${TOTAL_STEPS}`}
              role="status"
            >
              {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((stepNumber) => {
                const isActive = stage === stepNumber;
                const isPassed = stage > stepNumber;
                return (
                  <span
                    key={stepNumber}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? "w-8 bg-[#3b3226] dark:bg-[#e5be79]"
                        : isPassed
                          ? "w-5 bg-[#c9a35d] dark:bg-[#9c7838]"
                          : "w-1.5 bg-[#d9c9a8] dark:bg-[#3d3123]"
                    }`}
                  />
                );
              })}
            </div>
          )}

          {screen === "complete" ? (
            <span aria-hidden="true" className="h-12 w-12 shrink-0" />
          ) : (
            <LanguageSwitcher />
          )}
        </header>

        <div ref={contentRef} className="flex-1 pt-6">
          {/* ------------------------------ Welcome ------------------------------ */}
          {screen === "welcome" && (
            <div
              className={`transition-all duration-300 ${leaving ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
            >
              <h1 className="whitespace-nowrap text-[clamp(26px,7.5vw,34px)] font-light leading-[1.12] tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]">
                {t("onboarding.letsSetUpCare")}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {t("onboarding.welcomeSubtitle")}
              </p>

              <ol className="mt-8 space-y-5">
                {[
                  {
                    icon: <Heart size={20} strokeWidth={1.8} />,
                    title: t("onboarding.aboutYou"),
                    body: t("onboarding.aboutYouDesc"),
                  },
                  {
                    icon: <CalendarDays size={20} strokeWidth={1.8} />,
                    title: t("onboarding.yourDates"),
                    body: t("onboarding.yourDatesDesc"),
                  },
                  {
                    icon: <Baby size={20} strokeWidth={1.8} />,
                    title: t("onboarding.carePlan"),
                    body: t("onboarding.carePlanDesc"),
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3.5">
                    <span className="mt-0.5 text-[#8d6a2a] dark:text-[#e5be79]" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                        {index + 1}. {item.title}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-7 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#7b6642] dark:text-[#a8967b]">
                <Info
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-[#8d6a2a] dark:text-[#e5be79]"
                  aria-hidden="true"
                />
                {t("onboarding.timeEstimate")}
              </p>
            </div>
          )}

          {/* ------------------------------ Stages ------------------------------ */}
          {screen !== "welcome" && (
            <div
              className={`transition-all duration-300 ${leaving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
            >
              {stage === 1 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage1Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage1Sub")}
                  </p>

                  <div className="mt-7 space-y-5">
                    {/* Age */}
                    <div>
                      <label
                        htmlFor="age"
                        className="block text-[14.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]"
                      >
                        {t("onboarding.age")}
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="age"
                          type="number"
                          inputMode="numeric"
                          min={12}
                          max={65}
                          value={data.age}
                          onChange={(event) => update({ age: event.target.value })}
                          placeholder={t("onboarding.agePlaceholder")}
                          aria-invalid={Boolean(errors.age)}
                          className={`min-h-12 w-full rounded-2xl border bg-white/85 px-4 py-3 text-[15px] text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79] dark:focus:bg-[#1d1711] ${
                            errors.age
                              ? "border-[#9c3a29]/70 dark:border-[#e4725c]/70"
                              : "border-[#d8c6a4] dark:border-[#4a3c2c]"
                          }`}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#9b8a6f] dark:text-[#9c8b72]">
                          {t("onboarding.years")}
                        </span>
                      </div>
                      {errors.age && (
                        <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
                          {errors.age}
                        </p>
                      )}
                    </div>

                    {/* Residence area */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1.5 text-[14.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                          <MapPin
                            size={15}
                            strokeWidth={1.9}
                            className="text-[#8d6a2a] dark:text-[#e5be79]"
                            aria-hidden="true"
                          />
                          {t("onboarding.residenceArea")}
                        </label>
                        {data.residence && (
                          <span className="text-[12px] text-[#8d6a2a] dark:text-[#dfb870]">
                            {data.residence === "Rural" ? t("onboarding.rural") : t("onboarding.urban")}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <SegmentedSwitch<Residence>
                          label={t("onboarding.residenceArea")}
                          value={(data.residence as Residence) || "Urban"}
                          onChange={(value) => update({ residence: value })}
                          options={residencePillOptions}
                        />
                      </div>
                      {errors.residence && (
                        <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
                          {errors.residence}
                        </p>
                      )}
                    </div>

                    {/* Total pregnancies & Live births */}
                    <div className="divide-y divide-[#d8c6a4]/50 pt-1 dark:divide-[#3d3123]">
                      <NumberStepper
                        id="total-pregnancies"
                        label={t("onboarding.totalPregnancies")}
                        hint={t("onboarding.totalPregnanciesHint")}
                        value={data.totalPregnancies}
                        min={0}
                        max={20}
                        onChange={(value) => update({ totalPregnancies: value })}
                      />

                      <NumberStepper
                        id="live-births"
                        label={t("onboarding.liveBirths")}
                        hint={t("onboarding.liveBirthsHint")}
                        value={data.liveBirths}
                        min={0}
                        max={20}
                        onChange={(value) => update({ liveBirths: value })}
                      />
                    </div>
                    {errors.births && (
                      <p role="alert" className="text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
                        {errors.births}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 2 ------------------------------ */}
              {stage === 2 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage2Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage2Sub")}
                  </p>

                  <div className="mt-6">
                    <SegmentedSwitch<DatingMode>
                      label={t("onboarding.stage2Title")}
                      value={data.dating}
                      onChange={(value) => update({ dating: value })}
                      options={datingModeOptions}
                    />
                  </div>

                  {data.dating === "lmp" && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <div className="flex items-center justify-between gap-2.5">
                          <p className="flex min-w-0 items-center gap-1.5 text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                            <CalendarDays
                              size={15}
                              strokeWidth={1.9}
                              className="shrink-0 text-[#8d6a2a] dark:text-[#e5be79]"
                              aria-hidden="true"
                            />
                            <span>{t("onboarding.lastPeriodDay")}</span>
                          </p>
                          <ThemeSelect<CalendarSystem>
                            id="calendar-system"
                            label={t("onboarding.calendarSystem")}
                            value={(data.calendar || "gregorian") as CalendarSystem}
                            options={calendarSystemOptions}
                            onChange={(calendar) => {
                              if (calendar === data.calendar) return;
                              update({ calendar, lmpDay: "", lmpMonth: "", lmpYear: "" });
                            }}
                          />
                        </div>
                        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                          <DateSelect
                            id="lmp-day"
                            label={t("onboarding.day")}
                            value={data.lmpDay}
                            onChange={(value) => update({ lmpDay: value })}
                            options={dayOptions}
                            selectLabel={t("onboarding.select")}
                          />
                          <DateSelect
                            id="lmp-month"
                            label={t("onboarding.month")}
                            value={data.lmpMonth}
                            onChange={(value) => update({ lmpMonth: value })}
                            options={monthOptions}
                            selectLabel={t("onboarding.select")}
                          />
                          <DateSelect
                            id="lmp-year"
                            label={t("onboarding.year")}
                            value={data.lmpYear}
                            onChange={(value) => update({ lmpYear: value })}
                            options={years.map((year) => ({
                              value: String(year),
                              label: String(year),
                            }))}
                            selectLabel={t("onboarding.select")}
                          />
                        </div>
                        {errors.lmp && (
                          <p role="alert" className="mt-2 text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
                            {errors.lmp}
                          </p>
                        )}
                      </div>

                      {dating && dating.days >= 0 && (
                        <div aria-live="polite" className="home-glass-gold rounded-[22px] p-4.5">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6f5a35] dark:text-[#e5be79]">
                            {t("onboarding.basedOnDates")}
                          </p>
                          <p className="mt-1.5 text-[21px] font-medium leading-snug text-[#3b3226] dark:text-[#f5ede0]">
                            {dating.weeks} {t("onboarding.weeks")}, {dating.remainingDays}{" "}
                            {dating.remainingDays === 1 ? (isAmharic ? "ቀን" : "day") : (isAmharic ? "ቀናት" : "days")}{" "}
                            {t("onboarding.weeksAlong")}
                          </p>
                          <p className="mt-1 text-[13px] text-[#6f5a35] dark:text-[#d8c7ab]">
                            {dating.trimester === 0 ? t("onboarding.dueToday") : `${t("onboarding.trimester")} ${dating.trimester}`}
                            {dating.trimester > 0 ? " · " : ""}
                            {Math.max(0, 280 - dating.days)} {t("onboarding.daysToGo")}
                          </p>
                          <div className="mt-3 border-t border-[#b98a3e]/25 pt-2.5 dark:border-[#e5be79]/22">
                            <p className="text-[12px] text-[#7b6642] dark:text-[#b9a88e]">
                              {t("onboarding.estimatedDueDate")}
                            </p>
                            <p className="text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                              {dueText}
                            </p>
                            <p className="mt-0.5 text-[12px] text-[#85735a] dark:text-[#c7b69c]">
                              {dueEthiopian} ({t("onboarding.ethiopian")})
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.dating === "known" && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                          {t("onboarding.howManyWeeksDays")}
                        </p>
                        <div className="mt-2.5 grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="known-weeks"
                              className="block text-[12px] font-medium text-[#6f6149] dark:text-[#b9a88e]"
                            >
                              {t("onboarding.weeks")}
                            </label>
                            <input
                              id="known-weeks"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={42}
                              value={data.knownWeeks}
                              onChange={(event) => update({ knownWeeks: event.target.value })}
                              placeholder="0–42"
                              aria-invalid={Boolean(errors.known)}
                              className={`mt-1.5 min-h-12 w-full rounded-2xl border bg-white/85 px-4 py-3 text-[15px] tabular-nums text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79] dark:focus:bg-[#1d1711] ${
                                errors.known
                                  ? "border-[#9c3a29]/70 dark:border-[#e4725c]/70"
                                  : "border-[#d8c6a4] dark:border-[#4a3c2c]"
                              }`}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="known-days"
                              className="block text-[12px] font-medium text-[#6f6149] dark:text-[#b9a88e]"
                            >
                              {t("onboarding.daysLabel")}
                            </label>
                            <input
                              id="known-days"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={6}
                              value={data.knownDays}
                              onChange={(event) => update({ knownDays: event.target.value })}
                              placeholder="0–6"
                              className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#d8c6a4] bg-white/85 px-4 py-3 text-[15px] tabular-nums text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79] dark:focus:bg-[#1d1711]"
                            />
                          </div>
                        </div>
                        {errors.known && (
                          <p role="alert" className="mt-2 text-[12px] text-[#9c3a29] dark:text-[#f08b75]">
                            {errors.known}
                          </p>
                        )}
                      </div>

                      {data.knownWeeks !== "" &&
                        Number(data.knownWeeks) <= 42 &&
                        Number(data.knownDays) <= 6 && (
                          <div aria-live="polite" className="home-glass-gold rounded-[22px] p-4.5">
                            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6f5a35] dark:text-[#e5be79]">
                              {t("onboarding.basedOnKnown")}
                            </p>
                            <p className="mt-1.5 text-[21px] font-medium leading-snug text-[#3b3226] dark:text-[#f5ede0]">
                              {knownWeeks} {t("onboarding.weeks")}, {knownDays}{" "}
                              {knownDays === 1 ? (isAmharic ? "ቀን" : "day") : (isAmharic ? "ቀናት" : "days")}{" "}
                              {t("onboarding.weeksAlong")}
                            </p>
                            <p className="mt-1 text-[13px] text-[#6f5a35] dark:text-[#d8c7ab]">
                              {t("onboarding.trimester")} {dating?.trimester} ·{" "}
                              {Math.max(0, 280 - (knownWeeks * 7 + knownDays))} {t("onboarding.daysToGo")}
                            </p>
                            <div className="mt-3 border-t border-[#b98a3e]/25 pt-2.5 dark:border-[#e5be79]/22">
                              <p className="text-[12px] text-[#7b6642] dark:text-[#b9a88e]">
                                {t("onboarding.estimatedDueDate")}
                              </p>
                              <p className="text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                                {dueText}
                              </p>
                              <p className="mt-0.5 text-[12px] text-[#85735a] dark:text-[#c7b69c]">
                                {dueEthiopian} ({t("onboarding.ethiopian")})
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#7b6642] dark:text-[#a8967b]">
                    <Info
                      size={15}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-[#8d6a2a] dark:text-[#e5be79]"
                      aria-hidden="true"
                    />
                    {data.dating === "lmp"
                      ? t("onboarding.lmpHint")
                      : t("onboarding.knownHint")}
                  </p>
                </>
              )}

              {/* ------------------------------ Stage 3 ------------------------------ */}
              {stage === 3 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage3Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage3Sub")}
                  </p>

                  <div className="mt-7 space-y-6">
                    <YesNoQuestion
                      id="had-cesarean"
                      question={t("onboarding.cesareanQ")}
                      value={data.hadCesarean}
                      onChange={(value) => update({ hadCesarean: value })}
                      error={errors.cesarean}
                    />
                    <YesNoQuestion
                      id="had-stillbirth"
                      question={t("onboarding.stillbirthQ")}
                      value={data.hadStillbirth}
                      onChange={(value) => update({ hadStillbirth: value })}
                      error={errors.stillbirth}
                    />
                    <YesNoQuestion
                      id="malaria-area"
                      question={t("onboarding.malariaQ")}
                      value={data.malariaArea}
                      onChange={(value) => update({ malariaArea: value })}
                      error={errors.malaria}
                    />

                    <div className="border-t border-[#d8c6a4]/60 pt-5 dark:border-[#3d3123]">
                      <p className="text-[15px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                        {t("onboarding.complicationsTitle")}
                      </p>
                      <p className="mt-1 text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                        {t("onboarding.complicationsSub")}
                      </p>
                      <div className="mt-3 space-y-2">
                        {COMPLICATION_OPTIONS.map((option) => (
                          <ChoiceRow
                            key={option}
                            label={getOptionLabel(option)}
                            selected={data.complications.includes(option)}
                            onToggle={() =>
                              update({ complications: toggleListItem(data.complications, option) })
                            }
                          />
                        ))}

                        {data.customComplications.map((complication) => (
                          <div
                            key={complication}
                            className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#c9a35d] bg-[#fbe7b8]/70 px-4 py-3 dark:border-[#e5be79] dark:bg-[#e5be79]/18"
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span
                                aria-hidden="true"
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4a3f30] bg-[#4a3f30] text-[#fbe7b8] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                              >
                                <Check size={13} strokeWidth={3} />
                              </span>
                              <span className="truncate text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                                {complication}
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${complication}`}
                              onClick={() => {
                                update({
                                  customComplications: data.customComplications.filter(
                                    (entry) => entry !== complication,
                                  ),
                                  complications: data.complications.filter(
                                    (entry) => entry !== complication,
                                  ),
                                });
                              }}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#85735a] transition-colors hover:bg-white/70 hover:text-[#9c3a29] dark:text-[#b9a88e] dark:hover:bg-white/10 dark:hover:text-[#f08b75]"
                            >
                              <X size={15} strokeWidth={2.2} />
                            </button>
                          </div>
                        ))}

                        <ChoiceRow
                          label={t("onboarding.other")}
                          selected={showOtherComplicationField}
                          onToggle={() =>
                            setShowOtherComplicationField((current) => !current)
                          }
                        />
                      </div>

                      {showOtherComplicationField && (
                        <div className="mt-4">
                          <AddField
                            id="other-complication"
                            label={t("onboarding.specifyOtherComplication")}
                            placeholder={isAmharic ? "ለምሳሌ ፕላሴንታ ፕሪቪያ" : "e.g. Placenta previa"}
                            value={otherComplicationDraft}
                            onChange={setOtherComplicationDraft}
                            onAdd={() => {
                              const name = otherComplicationDraft.trim();
                              if (!name) return;
                              if (
                                !data.customComplications.some(
                                  (entry) => entry.toLowerCase() === name.toLowerCase(),
                                )
                              ) {
                                update({
                                  customComplications: [...data.customComplications, name],
                                  complications: data.complications.includes(name)
                                    ? data.complications
                                    : [...data.complications, name],
                                });
                              }
                              setOtherComplicationDraft("");
                            }}
                            addLabel={t("common.save")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 4 ------------------------------ */}
              {stage === 4 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage4Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage4Sub")}
                  </p>

                  <div className="mt-6 space-y-2">
                    {CONDITION_OPTIONS.map((option) => (
                      <ChoiceRow
                        key={option}
                        label={getOptionLabel(option)}
                        selected={data.conditions.includes(option)}
                        onToggle={() =>
                          update({ conditions: toggleListItem(data.conditions, option) })
                        }
                      />
                    ))}

                    {data.customConditions.map((condition) => (
                      <div
                        key={condition}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#c9a35d] bg-[#fbe7b8]/70 px-4 py-3 dark:border-[#e5be79] dark:bg-[#e5be79]/18"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4a3f30] bg-[#4a3f30] text-[#fbe7b8] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <span className="truncate text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                            {condition}
                          </span>
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${condition}`}
                          onClick={() => {
                            update({
                              customConditions: data.customConditions.filter(
                                (entry) => entry !== condition,
                              ),
                              conditions: data.conditions.filter((entry) => entry !== condition),
                            });
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#85735a] transition-colors hover:bg-white/70 hover:text-[#9c3a29] dark:text-[#b9a88e] dark:hover:bg-white/10 dark:hover:text-[#f08b75]"
                        >
                          <X size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                    ))}

                    <ChoiceRow
                      label={t("onboarding.other")}
                      selected={showOtherField}
                      onToggle={() => setShowOtherField((current) => !current)}
                    />
                  </div>

                  {showOtherField && (
                    <div className="mt-4">
                      <AddField
                        id="other-condition"
                        label={t("onboarding.specifyOtherCondition")}
                        placeholder={isAmharic ? "ለምሳሌ የታይሮይድ ችግር" : "e.g. Thyroid condition"}
                        value={otherConditionDraft}
                        onChange={setOtherConditionDraft}
                        onAdd={() => {
                          const name = otherConditionDraft.trim();
                          if (!name) return;
                          if (
                            !data.customConditions.some(
                              (entry) => entry.toLowerCase() === name.toLowerCase(),
                            )
                          ) {
                            update({
                              customConditions: [...data.customConditions, name],
                              conditions: data.conditions.includes(name)
                                ? data.conditions
                                : [...data.conditions, name],
                            });
                          }
                          setOtherConditionDraft("");
                        }}
                        addLabel={t("common.save")}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------ Stage 5 ------------------------------ */}
              {stage === 5 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage5Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage5Sub")}
                  </p>

                  <div className="mt-6 space-y-5">
                    <YesNoQuestion
                      id="takes-medications"
                      question={t("onboarding.takesMedicationsQ")}
                      value={data.takesMedications}
                      onChange={(value) => update({ takesMedications: value })}
                      error={errors.meds}
                    />

                    {data.takesMedications === true && (
                      <div>
                        <AddField
                          id="medication-name"
                          label={t("onboarding.specifyMedications")}
                          placeholder={isAmharic ? "ለምሳሌ ፎሊክ አሲድ 5ሚግ" : "e.g. Folic acid 5mg"}
                          value={medDraft}
                          onChange={setMedDraft}
                          onAdd={() => {
                            const name = medDraft.trim();
                            if (!name) return;
                            if (
                              !data.medications.some(
                                (entry) => entry.toLowerCase() === name.toLowerCase(),
                              )
                            ) {
                              update({ medications: [...data.medications, name] });
                            }
                            setMedDraft("");
                          }}
                          addLabel={t("common.save")}
                        />

                        {data.medications.length > 0 && (
                          <div className="mt-5">
                            <p className="text-[13.5px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]">
                              {t("onboarding.currentMedications")}
                            </p>
                            <ul
                              aria-label={t("onboarding.currentMedications")}
                              className="mt-2.5 space-y-2"
                            >
                              {data.medications.map((medication) => (
                                <li
                                  key={medication}
                                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full border border-[#c9a35d] bg-[#fbe7b8]/70 py-2 pl-4 pr-2.5 shadow-[0_6px_16px_-10px_rgba(160,120,50,0.45)] dark:border-[#e5be79] dark:bg-[#e5be79]/18"
                                >
                                  <span className="flex min-w-0 items-center gap-2.5">
                                    <Pill
                                      size={16}
                                      strokeWidth={1.85}
                                      aria-hidden="true"
                                      className="shrink-0 text-[#6f5a35] dark:text-[#e5be79]"
                                    />
                                    <span className="truncate text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                                      {medication}
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${medication}`}
                                    onClick={() =>
                                      update({
                                        medications: data.medications.filter(
                                          (entry) => entry !== medication,
                                        ),
                                      })
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#85735a] transition-colors hover:bg-white/70 hover:text-[#9c3a29] dark:text-[#b9a88e] dark:hover:bg-white/10 dark:hover:text-[#f08b75]"
                                  >
                                    <X size={15} strokeWidth={2.2} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 6 ------------------------------ */}
              {stage === 6 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage6Title")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage6Sub")}
                  </p>

                  <div className="mt-6 space-y-5">
                    <YesNoQuestion
                      id="takes-supplements"
                      question={t("onboarding.stage6Title")}
                      value={data.takesSupplements}
                      onChange={(value) => update({ takesSupplements: value })}
                      error={errors.supp}
                      hideLabel
                    />

                    {data.takesSupplements === true && (
                      <div>
                        <p className="text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                          {t("onboarding.selectSupplements")}
                        </p>
                        <div className="mt-2.5 space-y-2">
                          {SUPPLEMENT_CHOICE_OPTIONS.map((option) => (
                            <ChoiceRow
                              key={option}
                              label={getOptionLabel(option)}
                              selected={data.supplementChoices.includes(option)}
                              onToggle={() =>
                                update({
                                  supplementChoices: toggleListItem(data.supplementChoices, option),
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 7 ------------------------------ */}
              {stage === 7 && screen !== "complete" && (
                <div className="flex flex-col items-center text-center">
                  <MicRings />

                  <h2 className="mt-8 text-[30px] font-light leading-[1.12] tracking-[-0.03em] text-[#3b3226] dark:text-[#f5ede0]">
                    {t("onboarding.stage7Title")}
                  </h2>

                  <p className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                    {t("onboarding.stage7Sub")}
                  </p>

                  <div className="mt-8 w-full">
                    <MicWaveform />
                  </div>
                </div>
              )}

              {/* ---------------------------- Completed ----------------------------- */}
              {screen === "complete" && (
                <OnboardingComplete
                  onDone={() => {
                    router.push("/home");
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="relative z-20 w-full shrink-0 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto w-full max-w-[440px]">
          {screen === "complete" ? null : screen === "welcome" ? (
            <button
              type="button"
              onClick={startOnboarding}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92] dark:focus-visible:outline-[#e5be79]"
            >
              {t("onboarding.start")}
              <ArrowRight
                size={17}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          ) : stage === TOTAL_STEPS ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={tryVoiceCheckin}
                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92] dark:focus-visible:outline-[#e5be79]"
              >
                {t("onboarding.tryVoice")}
              </button>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="rounded-full px-4 py-2 text-[13.5px] font-medium text-[#6f6149] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#3b3226] dark:text-[#b9a88e] dark:hover:text-[#f5ede0]"
                >
                  {t("onboarding.skipForNow")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92] dark:focus-visible:outline-[#e5be79]"
            >
              {stage === TOTAL_STEPS ? t("onboarding.finish") : t("onboarding.continue")}
              <ArrowRight
                size={17}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
