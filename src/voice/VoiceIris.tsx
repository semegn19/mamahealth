"use client";

import { useId } from "react";
import { AlertTriangle } from "lucide-react";

export type OrbMode = "idle" | "speaking" | "listening" | "danger";

interface VoiceIrisProps {
  mode: OrbMode;
  animating?: boolean;
  className?: string;
}

const BLADE_ANGLES = [
  "0.0deg",
  "60.0deg",
  "120.0deg",
  "180.0deg",
  "240.0deg",
  "300.0deg",
];

/**
 * Mama Health Voice Iris animation.
 * Replaces the multi-disc orb with a mechanical camera iris aperture,
 * themed in warm gold and dark-mode candlelight.
 *
 * Requirements:
 * 1. Outer rim circle matches the stroke width, color, and opacity of the inner blades.
 * 2. Animation only runs actively when:
 *    - Question text animates on screen
 *    - In the "listening" state
 *    - When the answer is being processed and answered
 * 3. Pauses and resumes smoothly in place without abrupt resetting or jumping.
 */
export function VoiceIris({
  mode,
  animating = false,
  className = "",
}: VoiceIrisProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const playState = animating ? "running" : "paused";

  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: "min(230px, 28vh)",
        height: "min(230px, 28vh)",
      }}
    >
      {/* 1. Atmospheric Golden Bloom / Halo */}
      <div
        className={`pointer-events-none absolute inset-[-14%] rounded-full blur-2xl transition-all duration-700 ${
          mode === "danger"
            ? "bg-[radial-gradient(circle_at_50%_50%,rgba(198,90,69,0.32),rgba(246,224,216,0.18)_45%,transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(224,104,80,0.36),rgba(140,48,33,0.2)_46%,transparent_70%)] animate-pulse"
            : animating && mode === "listening"
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(233,189,120,0.44),rgba(251,231,184,0.22)_45%,transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(229,180,102,0.48),rgba(185,130,52,0.22)_46%,transparent_70%)] scale-105"
              : animating
                ? "bg-[radial-gradient(circle_at_50%_50%,rgba(233,189,120,0.35),rgba(251,231,184,0.18)_45%,transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(229,180,102,0.38),rgba(185,130,52,0.18)_46%,transparent_70%)] scale-102"
                : "bg-[radial-gradient(circle_at_50%_50%,rgba(233,189,120,0.22),rgba(251,231,184,0.1)_45%,transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(229,180,102,0.25),rgba(185,130,52,0.1)_46%,transparent_70%)] scale-100"
        }`}
      />

      {/* 2. SVG Iris Mechanism */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={`iris-root-${uid} relative h-full w-full select-none transition-colors duration-500 ${
          animating ? "is-running" : ""
        } ${
          mode === "danger"
            ? "text-[#c65a45] dark:text-[#e06850]"
            : "text-[#b88a3b] dark:text-[#e5be79]"
        }`}
      >
        <defs>
          <clipPath id={`iris-barrel-${uid}`}>
            <circle cx="32" cy="32" r="30" />
          </clipPath>

          {/* Core luminous glow in the center */}
          <radialGradient id={`iris-core-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
            <stop offset="50%" stopColor="currentColor" stopOpacity={0.15} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </radialGradient>
        </defs>

        <style>{`
          .iris-assembly-${uid} {
            transform-box: view-box;
            transform-origin: center;
            animation: iris-turn-${uid} 12s linear infinite;
            animation-play-state: paused;
            will-change: transform;
          }

          .iris-blade-${uid} {
            stroke: currentColor;
            stroke-width: 0.9;
            fill: currentColor;
            fill-opacity: 0.08;
            opacity: 0.75;
            transform-box: view-box;
            transform-origin: center;
            transform: rotate(var(--a));
            animation: iris-stop-${uid} 3s ease-in-out infinite;
            animation-play-state: paused;
          }

          /* Requirement 1: Outer rim matches the darkness, stroke-width, and opacity of the inner blades */
          .iris-rim-${uid} {
            stroke: currentColor;
            stroke-width: 0.9;
            opacity: 0.75;
          }

          .iris-glow-center-${uid} {
            transform-box: view-box;
            transform-origin: center;
            animation: iris-pulse-${uid} 3s ease-in-out infinite;
            animation-play-state: paused;
          }

          .iris-root-${uid}.is-running .iris-assembly-${uid},
          .iris-root-${uid}.is-running .iris-blade-${uid},
          .iris-root-${uid}.is-running .iris-glow-center-${uid} {
            animation-play-state: running;
          }

          @keyframes iris-stop-${uid} {
            0%, 100% { cy: 6px; }
            50%      { cy: 24px; }
          }

          @keyframes iris-turn-${uid} {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          @keyframes iris-pulse-${uid} {
            0%, 100% { transform: scale(0.8); opacity: 0.35; }
            50%      { transform: scale(1.3); opacity: 0.85; }
          }

          @media (prefers-reduced-motion: reduce) {
            .iris-assembly-${uid},
            .iris-glow-center-${uid},
            .iris-blade-${uid} {
              animation: none !important;
            }
          }
        `}</style>

        {/* Ambient center core visible when aperture expands */}
        <circle
          cx="32"
          cy="32"
          r="12"
          fill={`url(#iris-core-${uid})`}
          className={`iris-glow-center-${uid}`}
          style={{ animationPlayState: playState }}
        />

        {/* Clipped iris aperture blades */}
        <g clipPath={`url(#iris-barrel-${uid})`}>
          <g
            className={`iris-assembly-${uid}`}
            style={{ animationPlayState: playState }}
          >
            {BLADE_ANGLES.map((angle, i) => (
              <circle
                key={i}
                className={`iris-blade-${uid}`}
                cx="32"
                cy="16"
                r="30"
                style={
                  {
                    "--a": angle,
                    animationPlayState: playState,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        </g>

        {/* Outer circle: matched in darkness and weight to the inner blades */}
        <circle className={`iris-rim-${uid}`} cx="32" cy="32" r="30" />
      </svg>

      {/* Danger state alert icon overlay */}
      {mode === "danger" && (
        <span
          className="pointer-events-none absolute flex items-center justify-center text-[#c65a45] drop-shadow-[0_4px_16px_rgba(198,90,69,0.4)] dark:text-[#f87171]"
          aria-hidden="true"
        >
          <AlertTriangle size={38} strokeWidth={2.1} />
        </span>
      )}
    </div>
  );
}
