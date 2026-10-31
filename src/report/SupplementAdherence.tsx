import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { SupplementReport } from "./reportData";
import { useCountUp } from "./useInViewOnce";
import "./supplement-adherence.css";

function AnimatedSupplementPercent({
  percent,
  active,
  delay,
}: {
  percent: number | null;
  active: boolean;
  delay: number;
}) {
  const animatedPercent = Math.round(
    useCountUp(percent ?? 0, {
      active: active && percent !== null,
      duration: 1000,
      delay,
    }),
  );

  if (percent === null) return <>--</>;

  return (
    <>
      {animatedPercent}
      <span>%</span>
    </>
  );
}

export function SupplementAdherence({ supplements }: { supplements: SupplementReport[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [revealed, setRevealed] = useState(false);
  const id = useId();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <ul ref={listRef} className="supplement-list" data-revealed={revealed}>
        {supplements.map((supplement, index) => {
          const headingId = `${id}-${supplement.id}`;
          const percent = Math.min(100, Math.max(0, supplement.percent ?? 0));

          return (
            <li key={supplement.id}>
              <article
                className="supplement-card"
                aria-labelledby={headingId}
                data-supplement={supplement.id}
                style={{ "--fill-delay": `${index * 120}ms` } as CSSProperties}
              >
                <div
                  className="supplement-card__meter"
                  role={supplement.percent === null ? undefined : "meter"}
                  aria-label={`${supplement.name} days taken`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={supplement.percent === null ? undefined : percent}
                  aria-valuetext={`${percent}%: taken on ${supplement.takenDays} of ${supplement.loggedDays} logged days; ${supplement.missedDays} missed and ${supplement.unloggedDays} unlogged days.`}
                >
                  <span
                    className="supplement-card__fill"
                    aria-hidden="true"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="supplement-card__content">
                  <div className="min-w-0">
                    <h3 id={headingId} className="supplement-card__name">{supplement.name}</h3>
                    <p className="supplement-card__missed">
                      {supplement.loggedDays > 0
                        ? `${supplement.missedDays} ${supplement.missedDays === 1 ? "day" : "days"} missed`
                        : "No entries yet"}
                    </p>
                  </div>
                  <p className="supplement-card__percent" aria-hidden="true">
                    <AnimatedSupplementPercent
                      percent={supplement.percent}
                      active={revealed}
                      delay={index * 120}
                    />
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[12px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
        Based on logged days. Unlogged days aren't counted as missed.
      </p>
    </div>
  );
}