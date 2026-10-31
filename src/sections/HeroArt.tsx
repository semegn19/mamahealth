import { useId } from "react";
import "./hero-art.css";
import { HERO_STROKES, HERO_VIEWBOX } from "./heroStrokes";

/**
 * Landing-hero artwork: a line drawing of a pregnant belly cradled by hand,
 * threaded through vines and leaves.
 *
 * It is drawn entirely in the same illustration language as the Mama Health Method
 * art (see `method/CareIllustration.tsx`): gradient strokes running warm cream →
 * champagne → bronze, round caps and joins, heavier contour lines and lighter
 * detail lines, over a feathered champagne glow — so it sits *on* the hero
 * background rather than in a card of its own.
 *
 * The strokes are traced from the reference drawing and draw themselves on in
 * quick succession (long contours first), then drift gently.
 */

/**
 * Each stroke is drawn at the same unhurried pace as the Mama Health Method art
 * (~1.6s for a long contour). To keep the whole figure from taking ages, the
 * strokes are spread across parallel "lanes": a dozen lines start together and
 * the next wave follows almost immediately, so the drawing completes in roughly
 * two seconds while every individual line keeps that calm speed.
 */
const LANES = 12;
const WAVE_GAP = 0.3;

function strokeTimings() {
  return HERO_STROKES.map((stroke, index) => ({
    delay: (index % LANES) * 0.035 + Math.floor(index / LANES) * WAVE_GAP,
    duration: stroke.dur,
  }));
}

export function HeroArt() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const line = `hero-line-${uid}`;
  const soft = `hero-soft-${uid}`;
  const glow = `hero-glow-${uid}`;

  const timings = strokeTimings();

  return (
    <div aria-hidden="true" className="hero-art pointer-events-none absolute inset-0">
      {/* The drawing hugs the right edge; its size comes from the viewport height
          (so nothing is lost to the SVG's own letterboxing), which leaves the
          growing gap between headline and artwork in the middle of the hero. */}
      <div className="absolute inset-y-0 right-0 flex w-full items-center justify-center px-6 pb-10 pt-24 opacity-30 sm:opacity-40 lg:w-auto lg:justify-end lg:px-0 lg:pb-10 lg:pr-2 lg:pt-10 lg:opacity-100 xl:pr-5">
        <svg
          viewBox={HERO_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="h-full max-h-[86vh] w-auto max-w-none overflow-visible"
          style={{ aspectRatio: "360 / 515" }}
          role="presentation"
          focusable="false"
        >
          <defs>
            {/* Same gradient family as the method illustrations. */}
            <linearGradient id={line} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f6dfae" />
              <stop offset="50%" stopColor="#d9ab5e" />
              <stop offset="100%" stopColor="#a9782f" />
            </linearGradient>
            <linearGradient id={soft} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eed3a0" />
              <stop offset="100%" stopColor="#bd8c3f" />
            </linearGradient>
            <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="26" />
            </filter>
          </defs>

          {/* Feathered champagne pool, exactly like the method drawings. */}
          <g filter={`url(#${glow})`} className="opacity-60 dark:opacity-25">
            <ellipse cx="196" cy="256" rx="132" ry="188" className="fill-[#f6dfb2] dark:fill-[#c99642]" />
            <ellipse
              cx="214"
              cy="330"
              rx="86"
              ry="104"
              className="fill-[#eec584] dark:fill-[#8d6224]"
              opacity="0.6"
            />
          </g>

          {/* The drawing: contours first, then the lighter detail strokes. */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="hero-drift-slow">
            {HERO_STROKES.map((stroke, index) => (
              <path
                key={index}
                d={stroke.d}
                stroke={`url(#${stroke.w > 2.4 ? line : soft})`}
                strokeWidth={stroke.w}
                pathLength={1}
                className="hero-draw"
                style={
                  {
                    "--hero-delay": `${timings[index].delay}s`,
                    "--hero-dur": `${timings[index].duration}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
