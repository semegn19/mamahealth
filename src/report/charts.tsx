import type { CSSProperties } from "react";
import { useTranslation } from "../components/languageStore";
import {
  CALENDAR_CELLS,
  FOOD_GROUPS,
  MONTH,
  PERIOD,
  SEVERITY_LEVELS,
  worstSeverity,
  type DayRecord,
} from "./reportData";
import { useCountUp, useInViewOnce } from "./useInViewOnce";
import { localizeSymptom } from "./reportMetrics";

/* ------------------------------------------------------------------ */
/* Symptom severity calendar                                           */
/* ------------------------------------------------------------------ */

export function SeverityCalendar({
  selectedDay,
  onSelectDay,
  detailsId,
  dangerCountsByDay,
  cells,
  periodLabel,
}: {
  selectedDay: number | null;
  onSelectDay: (day: DayRecord) => void;
  detailsId: string;
  dangerCountsByDay?: Map<number, number>;
  cells?: (DayRecord | null)[];
  periodLabel?: string;
}) {
  const { t, isAmharic } = useTranslation();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const weekdays = isAmharic
    ? ["ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ", "እ"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  const displayCells = cells ?? CALENDAR_CELLS;

  return (
    <div ref={ref} role="group" aria-label={`Daily symptoms for ${periodLabel || PERIOD.label}`}>
      <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
        {weekdays.map((d, i) => (
          <span
            key={i}
            className="text-center text-[10.5px] font-medium tracking-wide text-[#a2937a] dark:text-[#9c8b72]"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {displayCells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} aria-hidden="true" />;

          const severity = worstSeverity(day);
          const dangerCount = dangerCountsByDay?.get(day.day) ?? 0;
          const isDanger = day.recorded && dangerCount > 0;
          const selected = selectedDay === day.day;
          const cellStyle: Record<string, string> = {
            "--cell-delay": `${(index % 7) * 28 + Math.floor(index / 7) * 55}ms`,
          };
          if (isDanger) {
            cellStyle.backgroundColor = "#a94432";
          } else if (severity) {
            cellStyle.backgroundColor = SEVERITY_LEVELS[severity].color;
          }
          const dateLabel = day.date.toLocaleDateString(isAmharic ? "am-ET" : "en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const description = !day.recorded
            ? (isAmharic ? "ምንም ምዝገባ አልተደረገም" : "No check-in recorded")
            : isDanger
              ? (isAmharic ? `${dangerCount} የአደጋ ምልክቶች ተመዝግበዋል` : `${dangerCount} danger sign${dangerCount === 1 ? "" : "s"} recorded`)
              : severity
                ? (isAmharic
                    ? `${day.symptoms.length} ምልክቶች፣ ከፍተኛ ደረጃ፡ ${SEVERITY_LEVELS[severity].label_am || SEVERITY_LEVELS[severity].label}`
                    : `${day.symptoms.length} symptom${day.symptoms.length === 1 ? "" : "s"}, highest severity: ${SEVERITY_LEVELS[severity].label}`)
                : (isAmharic ? "ምንም ምልክቶች አልተመዘገቡም" : "No symptoms recorded");

          return (
            <button
              key={day.day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={`${dateLabel}: ${description}`}
              aria-pressed={selected}
              aria-controls={detailsId}
              title={`${dateLabel}: ${description}`}
              className={`report-severity-cell ${inView ? "is-visible" : "is-pending"} relative flex aspect-square min-h-10 w-full cursor-pointer items-center justify-center rounded-[9px] border text-[12px] font-semibold tabular-nums transition-all duration-200 hover:scale-105 hover:z-10 hover:ring-2 hover:ring-[#6f4b1d] dark:hover:ring-[#e5be79] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a3f30] dark:focus-visible:outline-[#e5be79] motion-reduce:transition-none ${
                !day.recorded
                  ? "border-dashed border-[#b5a07c] text-[#6f6149] dark:border-[#66543f] dark:text-[#9c8b72]"
                  : isDanger
                    ? "border-[#883022] text-[#fff7f2] shadow-[0_3px_10px_-3px_rgba(156,58,41,0.55)]"
                    : severity
                      ? "border-transparent text-[#2e2519]"
                      : "border-[#e2d3b4] bg-[#faf5eb] text-[#4a3f30] dark:border-[#3d3123] dark:bg-[#19140f] dark:text-[#dfcfb6]"
              } ${
                selected
                  ? "z-10 scale-105 font-bold ring-2 ring-[#6f4b1d] ring-offset-2 ring-offset-[#fbf6ec] shadow-md dark:ring-[#e5be79] dark:ring-offset-[#221c15]"
                  : ""
              }`}
              style={cellStyle as CSSProperties}
            >
              <span>{day.day}</span>
              {isDanger && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#fff7f2] shadow-sm"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Symptom frequency bars                                               */
/* ------------------------------------------------------------------ */

function SymptomBarRow({
  row,
  max,
  index,
  active,
}: {
  row: { name: string; count: number; avg: number };
  max: number;
  index: number;
  active: boolean;
}) {
  const { t, isAmharic } = useTranslation();
  const animatedCount = Math.round(
    useCountUp(row.count, { active, duration: 850, delay: index * 90 }),
  );
  const localizedName = localizeSymptom(row.name, isAmharic, t);

  return (
    <li
      className="flex items-center gap-3 transition-[opacity,transform] duration-500 motion-reduce:transition-none"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(5px)",
        transitionDelay: `${index * 70}ms`,
      }}
    >
      <span className="w-[74px] shrink-0 text-[13px] text-[#4a3f30] dark:text-[#dfcfb6]">
        {localizedName}
      </span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#ecdfc5] dark:bg-[#31271c]">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-[#d9ab5e] to-[#b98a3e] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{
            width: active ? `${(row.count / max) * 100}%` : "0%",
            transitionDelay: `${index * 90}ms`,
          }}
        />
      </span>
      <span className="w-[46px] shrink-0 text-right text-[12px] text-[#85735a] dark:text-[#9c8b72]">
        <span className="sr-only">{row.count} {isAmharic ? "ቀናት" : "days"}</span>
        <span aria-hidden="true">{animatedCount}{isAmharic ? "ቀ" : "d"}</span>
      </span>
    </li>
  );
}

export function SymptomBars({
  rows,
}: {
  rows: { name: string; count: number; avg: number }[];
}) {
  const { ref, inView } = useInViewOnce<HTMLUListElement>(0.3);
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul ref={ref} className="space-y-2.5">
      {rows.map((row, index) => (
        <SymptomBarRow key={row.name} row={row} max={max} index={index} active={inView} />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Food-group stacked bars (one bar per day)                           */
/* ------------------------------------------------------------------ */

const BAR_HEIGHT = 92;

export function FoodGroupBars() {
  return (
    <div className="flex items-end gap-[3px]" style={{ height: BAR_HEIGHT }}>
      {MONTH.map((day) => (
        <div key={day.day} className="flex flex-1 flex-col justify-end gap-[2px]">
          {day.recorded ? (
            [...day.foodGroups].reverse().map((group) => (
              <span
                key={group}
                className="block w-full rounded-[2px]"
                style={{
                  height: `${(BAR_HEIGHT - 4) / 5}px`,
                  background: FOOD_GROUPS[group].color,
                }}
                title={`Sept ${day.day}: ${FOOD_GROUPS[group].name}`}
              />
            ))
          ) : (
            <span
              className="block w-full rounded-[2px] border border-dashed border-[#cdbb9a] dark:border-[#66543f]"
              style={{ height: 6 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
