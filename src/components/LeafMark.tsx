"use client";

import { useId } from "react";

/**
 * Mama Health brand mark — a calla-style bud, drawn after the reference photograph:
 * a bract folded over itself, its lit face striated with fine veins that run
 * down into the stem, and a bright edge along the fold.
 *
 * Three things carry the photograph: the leaning bud silhouette (wide belly low,
 * long soft point), the soft light falling across the face (a gradient from the
 * lit side into the shadowed fold, never a hard band), and the striation. The
 * veins only resolve from splash size upwards; below ~40px they settle into a
 * faint sheen and the silhouette and crease do the work.
 *
 * Everything is painted with `currentColor`, so the same mark reads on the ink
 * badge (light mode) and the gold badge (dark mode), and on the cream mat behind
 * the share QR code.
 */

/** Outer silhouette: wide belly low-left, long point leaning right. */
const OUTLINE =
  "M15.3 28.6C12.2 27.1 9.2 23.9 8.3 19.9C7.3 15 11.3 9.7 15.5 5.9C16.9 4.7 18.2 4 19.3 3.5C20.8 7.4 21.8 13.2 21.4 18.4C21.1 22.9 18.9 26.6 15.3 28.6Z";

/** The bract's edge where it curls over — the brightest line in the drawing. */
const CREASE =
  "M19.3 3.5C18.3 9.2 18.1 16 18.8 21.5C18.3 24.4 17 26.9 15.3 28.6";

const STEM = "M14.8 28.1c.4 1.2.4 2.3.2 3.4h1.2c-.2-1.1-.2-2.2.2-3.4Z";

/**
 * Fine veins. They gather at the neck and fan along the leaning tip, but only
 * survive in the upper half of the bract — further down the photograph's
 * striation dissolves into the smooth belly, and drawing them all the way makes
 * the mark look ribbed rather than silky.
 */
const VEINS = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const bx = 12.6 + 6 * t;
  const by = 25.4 - 1.4 * t;
  const tx = 12.4 + 6.8 * t;
  const ty = 11.2 - 7.4 * t;
  const cx = (bx + tx) / 2 - (1.3 - 0.7 * t);
  const cy = (by + ty) / 2 + 0.7;
  return {
    ty,
    d: `M${bx.toFixed(2)} ${by.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`,
  };
});

export function LeafMark({ className = "h-[25px] w-[25px]" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `leaf-lit-${uid}`;
  const clipId = `leaf-bud-${uid}`;
  const veilId = `leaf-veil-${uid}`;
  const maskId = `leaf-mask-${uid}`;
  const ridge = "currentColor";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`leaf-mark ${className}`.trim()}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={OUTLINE} />
        </clipPath>
        {/* light falling across the bract: open on the lit side, deeper into the fold */}
        <linearGradient id={gradientId} x1="0.1" y1="0.04" x2="0.94" y2="0.52">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.62" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.76" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
        {/* the striation dissolves as it nears the belly */}
        <linearGradient id={veilId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="32" height="32" fill={`url(#${veilId})`} />
        </mask>
      </defs>

      <g fill={`url(#${gradientId})`}>
        <path d={OUTLINE} />
        <path d={STEM} />
      </g>

      {/* striation, held inside the silhouette */}
      <g
        clipPath={`url(#${clipId})`}
        mask={`url(#${maskId})`}
        fill="none"
        stroke={ridge}
        strokeWidth={0.2}
        strokeLinecap="round"
      >
        {VEINS.map((vein) => (
          <path key={vein.d} d={vein.d} />
        ))}
      </g>

      {/* the lit edge of the fold */}
      <path
        d={CREASE}
        fill="none"
        stroke={ridge}
        strokeWidth={0.55}
        strokeLinecap="round"
        opacity={0.95}
      />
    </svg>
  );
}
