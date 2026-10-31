import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { BotanicalArt } from "./BotanicalIllustration";

/**
 * Meaningful line-art illustrations drawn with soft golden gradient strokes
 * (instead of dark ink), over a feathered champagne glow so they sit airily
 * on the page. Each line draws itself in as the row scrolls into view.
 */

export type CareArt = "morning" | "kicks" | "midwife";

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

type StrokeProps = {
  d: string;
  w?: number;
  delay?: number;
  dur?: number;
  grad: string;
  draw: boolean;
  opacity?: number;
};

function Stroke({ d, w = 9, delay = 0, dur = 2.2, grad, draw, opacity = 1 }: StrokeProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={`url(#${grad})`}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      opacity={opacity}
      style={{
        strokeDasharray: 1,
        strokeDashoffset: draw ? 0 : 1,
        transition: `stroke-dashoffset ${dur}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
      }}
    />
  );
}

/** Gentle fade-in used for solid (filled) parts once the lines have drawn. */
function fadeIn(draw: boolean, delay: number, to = 1, dur = 1): CSSProperties {
  return {
    opacity: draw ? to : 0,
    transition: `opacity ${dur}s ease ${delay}s`,
  };
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      {/* Main line gradient: warm cream → champagne → bronze */}
      <linearGradient id={`line-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f6dfae" />
        <stop offset="50%" stopColor="#d9ab5e" />
        <stop offset="100%" stopColor="#a9782f" />
      </linearGradient>
      {/* Secondary, lighter gradient for accents */}
      <linearGradient id={`soft-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3d9" />
        <stop offset="100%" stopColor="#e2b86e" />
      </linearGradient>
      {/* Cream negative-space lines, like the light gaps in a solid mark */}
      <linearGradient id={`cream-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="100%" stopColor="#f6e6c4" />
      </linearGradient>
      <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
    </defs>
  );
}

/** Soft champagne pool behind each drawing so it melts into the page. */
function Backdrop({ uid }: { uid: string }) {
  return (
    <g filter={`url(#glow-${uid})`} className="opacity-55 dark:opacity-20">
      <ellipse cx="200" cy="210" rx="150" ry="130" className="fill-[#f6dfb2] dark:fill-[#c99642]" />
      <ellipse
        cx="240"
        cy="250"
        rx="100"
        ry="80"
        className="fill-[#eec584] dark:fill-[#8d6224]"
        opacity="0.6"
      />
    </g>
  );
}

/* ---------------------------------------------------------------- */
/* 01 · Morning check-in: sun rising over calm water, a sprout of a  */
/*      new day. Gentle, hopeful, daily.                             */
/* ---------------------------------------------------------------- */
function MorningArt({ uid, draw }: { uid: string; draw: boolean }) {
  const line = `line-${uid}`;
  const soft = `soft-${uid}`;
  return (
    <>
      {/* Sun */}
      <Stroke grad={line} draw={draw} w={10} dur={1.8}
        d="M 122 212 A 78 78 0 0 1 278 212" />
      {/* Rays */}
      <Stroke grad={soft} draw={draw} w={8} delay={0.9} dur={0.5} d="M 200 96 L 200 72" />
      <Stroke grad={soft} draw={draw} w={8} delay={1.0} dur={0.5} d="M 145 118 L 128 101" />
      <Stroke grad={soft} draw={draw} w={8} delay={1.1} dur={0.5} d="M 255 118 L 272 101" />
      <Stroke grad={soft} draw={draw} w={8} delay={1.2} dur={0.5} d="M 103 170 L 80 161" />
      <Stroke grad={soft} draw={draw} w={8} delay={1.3} dur={0.5} d="M 297 170 L 320 161" />
      {/* Water */}
      <Stroke grad={line} draw={draw} w={9} delay={0.5} dur={1.6}
        d="M 56 252 C 104 232 142 272 196 252 C 250 232 294 272 344 252" />
      <Stroke grad={soft} draw={draw} w={7} delay={0.8} dur={1.4} opacity={0.75}
        d="M 92 292 C 134 274 166 308 212 292 C 258 276 288 306 322 292" />
      {/* Sprout of the new day */}
      <Stroke grad={line} draw={draw} w={7} delay={1.5} dur={0.9}
        d="M 200 338 C 201 322 199 310 200 294" />
      <Stroke grad={soft} draw={draw} w={7} delay={1.9} dur={0.7}
        d="M 200 310 C 184 306 174 294 173 280 C 188 282 199 294 200 308" />
      <Stroke grad={soft} draw={draw} w={7} delay={2.1} dur={0.7}
        d="M 200 300 C 216 296 226 284 227 270 C 212 272 201 284 200 298" />
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 03 · Midwife: a flowing mother-and-child silhouette with open      */
/*      negative space between the parent, arm, and curled infant.    */
/* ---------------------------------------------------------------- */
function MidwifeArt({ uid, draw }: { uid: string; draw: boolean }) {
  const line = `line-${uid}`;
  return (
    <svg
      x="62"
      y="0"
      width="276"
      height="400"
      viewBox="385 45 320 465"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Each gold-filled curve is a separate silhouette; the gaps remain transparent. */}
      <path
        d="M476 100 C484 74 506 56 531 54 C566 48 599 70 611 99 C612 102 612 104 609 103 C579 79 553 74 530 78 C509 81 490 89 476 100 Z"
        fill={`url(#${line})`}
        style={fadeIn(draw, 0.15, 1, 1.1)}
      />
      <path
        d="M584 94 C557 89 532 105 519 127 C504 151 513 181 525 203 C540 231 548 248 542 267 C538 284 521 304 501 318 C481 333 465 356 465 381 C464 400 476 415 495 420 C521 426 550 412 573 397 C602 379 621 355 630 337 C633 369 611 406 578 433 C552 455 524 467 501 469 C462 472 432 455 412 427 C394 402 393 365 400 335 C410 289 442 202 460 156 C481 103 529 72 570 88 C575 90 580 92 584 94 Z"
        fill={`url(#${line})`}
        style={fadeIn(draw, 0.55, 1, 1.4)}
      />
      <path
        d="M594 108 C607 110 617 122 623 141 C641 192 673 279 686 320 C701 367 689 418 658 456 C632 488 597 499 562 498 C536 498 514 493 500 484 C542 485 584 462 612 434 C639 406 652 371 649 344 C646 310 627 279 601 255 C579 234 557 218 546 199 C540 189 538 178 541 176 C544 174 555 185 562 185 C569 174 577 166 585 164 C584 154 587 145 591 136 C597 123 598 115 594 108 Z"
        fill={`url(#${line})`}
        style={fadeIn(draw, 0.95, 1, 1.4)}
      />
      <path
        d="M548 316 C553 297 565 281 582 280 C601 277 617 291 619 309 C624 329 606 358 582 382 C563 401 533 409 510 404 C490 402 482 393 486 377 C490 357 507 342 528 334 C546 326 565 324 585 328 C589 324 591 319 591 312 C590 301 586 293 580 293 C572 291 565 304 561 311 C557 317 552 320 548 316 Z"
        fill={`url(#${line})`}
        style={fadeIn(draw, 1.35, 1, 1.3)}
      />
    </svg>
  );
}

export function CareIllustration({ art, className = "" }: { art: CareArt; className?: string }) {
  const raw = useId();
  const uid = raw.replace(/:/g, "");
  const { ref, inView } = useInView<SVGSVGElement>();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Reduced motion: show the finished drawing immediately.
  const draw = inView || reduced;

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      className={`h-full w-full ${className}`}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <Defs uid={uid} />
      <Backdrop uid={uid} />
      {art === "morning" && <MorningArt uid={uid} draw={draw} />}
      {art === "kicks" && <BotanicalArt uid={uid} draw={draw} />}
      {art === "midwife" && <MidwifeArt uid={uid} draw={draw} />}
    </svg>
  );
}
