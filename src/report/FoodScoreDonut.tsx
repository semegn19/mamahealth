import { useId, useState } from "react";
import { Apple, Beef, Carrot, ChevronDown, Milk, Wheat } from "lucide-react";
import { FOOD_GROUPS, FOOD_ITEM_COUNTS } from "./reportData";
import { useCountUp, useInViewOnce } from "./useInViewOnce";

const ICONS = [Wheat, Beef, Milk, Apple, Carrot] as const;

type FoodTotals = {
  counts: number[];
  score: number;
};

const SIZE = 320;
const C = SIZE / 2;
const THICKNESS = 30;
const RADIUS = 98;
const CAP_ANGLE = THICKNESS / 2 / RADIUS;
const GUTTER = (5 * Math.PI) / 180;

function point(radius: number, angle: number) {
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

function arc(startAngle: number, endAngle: number) {
  const s = point(RADIUS, startAngle);
  const e = point(RADIUS, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

function AnimatedFoodCount({
  value,
  active,
  delay,
}: {
  value: number;
  active: boolean;
  delay: number;
}) {
  return <>{Math.round(useCountUp(value, { active, duration: 950, delay }))}</>;
}

/**
 * Segmented donut with true gutters, rounded ends, in-segment icons,
 * and an expandable list of foods logged in each group.
 */
export function FoodScoreDonut({ counts, score }: FoodTotals) {
  const uid = useId().replace(/:/g, "");
  const filterId = `food-lift-${uid}`;
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);
  const animatedScore = useCountUp(score, { active: inView, duration: 1200 });
  const total = counts.reduce((sum, value) => sum + value, 0) || 1;

  const ideal = counts.map((count, i) => {
    const sweep = (count / total) * Math.PI * 2;
    return { count, sweep, index: i };
  });

  let cursor = -Math.PI / 2;
  const segments = ideal.map((item) => {
    const visibleStart = cursor + GUTTER / 2;
    const visibleEnd = cursor + item.sweep - GUTTER / 2;
    cursor += item.sweep;

    const drawStart = Math.min(visibleStart + CAP_ANGLE, visibleEnd - CAP_ANGLE - 0.01);
    const drawEnd = Math.max(visibleEnd - CAP_ANGLE, drawStart + 0.01);
    const iconAngle = Math.min(drawStart, (visibleStart + visibleEnd) / 2);
    const icon = point(RADIUS, iconAngle);

    return {
      name: FOOD_GROUPS[item.index].name,
      color: FOOD_GROUPS[item.index].color,
      count: item.count,
      d: arc(drawStart, drawEnd),
      iconX: icon.x,
      iconY: icon.y,
      Icon: ICONS[item.index],
      delay: item.index * 100,
      foods: FOOD_ITEM_COUNTS[FOOD_GROUPS[item.index].name] ?? [],
    };
  });

  const toggle = (name: string) => {
    setOpenGroup((current) => (current === name ? null : name));
  };

  return (
    <div ref={ref} className="grid items-start gap-6 sm:grid-cols-[1fr_auto] sm:gap-7">
      <div className="mx-auto w-full max-w-[320px] sm:order-2 sm:sticky sm:top-4">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Food group balance score ${score.toFixed(1)} out of 10`}
        >
          <defs>
            <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow
                dx="0"
                dy="7"
                stdDeviation="5"
                floodColor="#8a5f1d"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          <circle
            cx={C}
            cy={C}
            r={RADIUS}
            fill="none"
            strokeWidth={THICKNESS}
            className="food-donut-track stroke-[#f1e6d1] dark:stroke-[#31271c]"
            style={{ opacity: inView ? 1 : 0.35, transition: "opacity 500ms ease-out" }}
          />

          <g filter={`url(#${filterId})`}>
            {segments.map((seg) => (
              <path
                key={seg.name}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth={THICKNESS}
                strokeLinecap="round"
                pathLength={1}
                className="food-donut-segment cursor-pointer"
                style={{
                  opacity: !inView ? 0 : openGroup && openGroup !== seg.name ? 0.45 : 1,
                  strokeDasharray: 1,
                  strokeDashoffset: inView ? 0 : 1,
                  transition: `stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1) ${seg.delay}ms, opacity 220ms ease`,
                }}
                onClick={() => toggle(seg.name)}
              />
            ))}
          </g>

          {segments.map((seg) => (
            <g
              key={`icon-${seg.name}`}
              transform={`translate(${seg.iconX} ${seg.iconY})`}
              className="food-donut-icon cursor-pointer"
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 350ms ease-out ${seg.delay + 420}ms`,
              }}
              onClick={() => toggle(seg.name)}
            >
              <circle r="14" fill="#fffaf1" fillOpacity="0.9" />
              <foreignObject x="-10" y="-10" width="20" height="20">
                <div className="flex h-5 w-5 items-center justify-center text-[#3b3226]">
                  <seg.Icon size={12.5} strokeWidth={2} aria-hidden="true" />
                </div>
              </foreignObject>
            </g>
          ))}

          <text
            x={C}
            y={C - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#3b3226] dark:fill-[#f5ede0] tabular-nums"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 46,
              fontWeight: 300,
              letterSpacing: "-0.03em",
            }}
          >
            {animatedScore.toFixed(1)}
          </text>
          <text
            x={C}
            y={C + 28}
            textAnchor="middle"
            className="fill-[#85735a] dark:fill-[#a8967b]"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "1.6px",
            }}
          >
            FOOD BALANCE
          </text>
        </svg>
      </div>

      <div className="sm:order-1">
        <ul className="space-y-2">
          {segments.map((seg) => {
            const open = openGroup === seg.name;
            const panelId = `food-items-${seg.name.toLowerCase()}`;
            const maxTimes = Math.max(...seg.foods.map((f) => f.times), 1);

            return (
              <li key={seg.name} data-food-group={seg.name}>
                <button
                  type="button"
                  onClick={() => toggle(seg.name)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className={`flex w-full items-center gap-3 rounded-[16px] px-2 py-2 text-left transition hover:bg-white/55 dark:hover:bg-white/6 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79] ${
                    open ? "bg-white/70 dark:bg-white/8" : ""
                  }`}
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/75 text-[#4a3f30] shadow-[0_2px_6px_rgba(120,85,30,0.12)] dark:bg-[#2c231a] dark:text-[#f0e4ce]">
                    <seg.Icon size={16} strokeWidth={1.9} aria-hidden="true" />
                    <span
                      aria-hidden="true"
                      className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#fbf6ec] dark:ring-[#221c15]"
                      style={{ background: seg.color }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-[#4a3f30] dark:text-[#f0e4ce]">
                      {seg.name}
                    </span>
                    <span className="block text-[11px] text-[#9b8a6f] dark:text-[#9c8b72]">
                      {Math.round((seg.count / total) * 100)}% of days
                    </span>
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums text-[#3b3226] dark:text-[#f5ede0]">
                    <span className="sr-only">{seg.count}</span>
                    <span aria-hidden="true">
                      <AnimatedFoodCount value={seg.count} active={inView} delay={seg.delay} />
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`shrink-0 text-[#9b8a6f] dark:text-[#9c8b72] transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-label={`Foods in ${seg.name}`}
                  hidden={!open}
                  className={open ? "food-expand px-2 pb-2 pt-1" : "hidden"}
                >
                  <ul className="space-y-2 rounded-[14px] bg-[#fffaf1]/80 px-3 py-2.5 dark:bg-[#18130e]/85">
                    {seg.foods.map((food) => (
                      <li key={food.name} className="flex items-center gap-2.5">
                        <span className="w-[108px] shrink-0 text-[12.5px] text-[#4a3f30] dark:text-[#dfcfb6]">
                          {food.name}
                        </span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ecdfc5] dark:bg-[#31271c]">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(food.times / maxTimes) * 100}%`,
                              background: seg.color,
                            }}
                          />
                        </span>
                        <span className="w-[52px] shrink-0 text-right text-[11.5px] tabular-nums text-[#6f6149] dark:text-[#b9a88e]">
                          {food.times}×
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
          Tap a group to see which foods were logged, and how often.
        </p>
      </div>
    </div>
  );
}
