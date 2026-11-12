"use client";

import { useMemo } from "react";

export interface AvatarDefinition {
  id: string;
  nameEn: string;
  nameAm: string;
  // Lighter, luminous pastel gradients
  bg: string;
  borderColor: string;
  shadow: string;
  iconStroke: string;
  iconFill: string;
  accentDot: string;
  glow: string;
}

export const AVATAR_OPTIONS: AvatarDefinition[] = [
  {
    id: "sunshine",
    nameEn: "Happy Sunshine",
    nameAm: "ፀሐይ",
    bg: "from-[#fffdf0] via-[#fef8db] to-[#fef0b3]",
    borderColor: "border-[#fae38c] dark:border-[#ebd26e]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(220,180,60,0.32)]",
    iconStroke: "#8f6712",
    iconFill: "rgba(245, 210, 95, 0.35)",
    accentDot: "#d99f18",
    glow: "rgba(255, 246, 200, 0.75)",
  },
  {
    id: "lotus",
    nameEn: "Blooming Lotus",
    nameAm: "ውብ አበባ",
    bg: "from-[#fff7f9] via-[#fde9ee] to-[#fbcdd8]",
    borderColor: "border-[#f6aec0] dark:border-[#e88aa1]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(214,92,125,0.28)]",
    iconStroke: "#9c3b58",
    iconFill: "rgba(244, 156, 180, 0.35)",
    accentDot: "#c94f74",
    glow: "rgba(253, 214, 224, 0.75)",
  },
  {
    id: "moonstar",
    nameEn: "Peaceful Moon",
    nameAm: "ጨረቃና ኮከብ",
    bg: "from-[#fcf8ff] via-[#f5ebfc] to-[#e8d4f7]",
    borderColor: "border-[#d8bbf0] dark:border-[#b88ee0]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(150,90,200,0.28)]",
    iconStroke: "#6c3d91",
    iconFill: "rgba(207, 166, 240, 0.35)",
    accentDot: "#9355c2",
    glow: "rgba(240, 220, 253, 0.75)",
  },
  {
    id: "sprout",
    nameEn: "Little Sprout",
    nameAm: "አዲስ ህይወት",
    bg: "from-[#f8fbf6] via-[#edf6ea] to-[#d9edd4]",
    borderColor: "border-[#bcdbb2] dark:border-[#86b577]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(110,165,100,0.28)]",
    iconStroke: "#3b682e",
    iconFill: "rgba(164, 214, 153, 0.35)",
    accentDot: "#589647",
    glow: "rgba(222, 244, 216, 0.75)",
  },
  {
    id: "heart",
    nameEn: "Heart in Hands",
    nameAm: "ፍቅርና እንክብካቤ",
    bg: "from-[#fffaf3] via-[#fef1df] to-[#fce2bf]",
    borderColor: "border-[#f7ce99] dark:border-[#e8b26e]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(218,140,55,0.28)]",
    iconStroke: "#945618",
    iconFill: "rgba(245, 188, 120, 0.35)",
    accentDot: "#c97926",
    glow: "rgba(254, 230, 198, 0.75)",
  },
  {
    id: "butterfly",
    nameEn: "Sweet Butterfly",
    nameAm: "ቢራቢሮ",
    bg: "from-[#f6fbff] via-[#eaf4fe] to-[#d2e7fc]",
    borderColor: "border-[#b5d5f8] dark:border-[#7bafee]/50",
    shadow: "shadow-[0_4px_16px_-4px_rgba(90,145,215,0.28)]",
    iconStroke: "#2c5b92",
    iconFill: "rgba(158, 200, 248, 0.35)",
    accentDot: "#417bc3",
    glow: "rgba(218, 236, 254, 0.75)",
  },
];

export function resolveAvatarIndex(name?: string, avatarIndex?: number): number {
  if (typeof avatarIndex === "number" && avatarIndex >= 0 && avatarIndex < AVATAR_OPTIONS.length) {
    return avatarIndex;
  }
  const clean = (name && name.toLowerCase() !== "amara bennett" ? name : "Mama").trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_OPTIONS.length;
}

interface UserAvatarProps {
  name?: string;
  avatarIndex?: number;
  size?: number;
  className?: string;
}

/**
 * A delightful, light, and charming maternal avatar.
 * Uses soft pastel tones and friendly vector artwork tailored for mothers.
 */
export function UserAvatar({
  name = "Mama",
  avatarIndex,
  size = 48,
  className = "",
}: UserAvatarProps) {
  const safeName = name && name.toLowerCase() !== "amara bennett" ? name : "Mama";
  const index = useMemo(
    () => resolveAvatarIndex(safeName, avatarIndex),
    [safeName, avatarIndex],
  );

  const safeIndex =
    typeof index === "number" && index >= 0 && index < AVATAR_OPTIONS.length
      ? index
      : 0;
  const avatar = AVATAR_OPTIONS[safeIndex] ?? AVATAR_OPTIONS[0];

  return (
    <div
      role="img"
      aria-label={`Avatar: ${avatar.nameEn} for ${name}`}
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-br ${avatar.bg} ${avatar.borderColor} ${avatar.shadow} ring-2 ring-white/95 dark:ring-[#231b12] ${className}`}
    >
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${avatar.glow}, transparent 70%)`,
        }}
      />

      {/* Centered Maternal Art Vector */}
      <svg
        viewBox="0 0 48 48"
        className="relative z-10 h-[68%] w-[68%] transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {avatar.id === "sunshine" && (
          // Cheerful Smiling Sun
          <g>
            <circle
              cx="24"
              cy="24"
              r="9.5"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
            />
            <circle cx="20.5" cy="22" r="1.3" fill={avatar.iconStroke} />
            <circle cx="27.5" cy="22" r="1.3" fill={avatar.iconStroke} />
            <path
              d="M21 25.5c.8 1.2 4.2 1.2 5 0"
              stroke={avatar.iconStroke}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="18" cy="24.5" r="1.2" fill={avatar.accentDot} opacity="0.65" />
            <circle cx="30" cy="24.5" r="1.2" fill={avatar.accentDot} opacity="0.65" />
            <path
              d="M24 7.5v3M24 37.5v3M7.5 24h3M37.5 24h3M12.5 12.5l2.2 2.2M33.3 33.3l2.2 2.2M12.5 35.5l2.2-2.2M33.3 14.7l2.2-2.2"
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {avatar.id === "lotus" && (
          // Blooming Lotus
          <g>
            <path
              d="M24 13c-3.5 5.5-3.5 13 0 18.5 3.5-5.5 3.5-13 0-18.5z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 20c-4.5 0-8.5 3.5-9.5 8 3.5 2 8 1 10.5-1.5"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 20c4.5 0 8.5 3.5 9.5 8-3.5 2-8 1-10.5-1.5"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 33.5c6.5 2.5 13.5 2.5 20 0"
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="20" r="1.8" fill={avatar.accentDot} />
          </g>
        )}

        {avatar.id === "moonstar" && (
          // Peaceful Moon & Baby Star
          <g>
            <path
              d="M28 11.5a12.5 12.5 0 1 1-12.5 12.5c0-.8.1-1.5.3-2.3a9 9 0 0 0 10.7-10c.5-.1 1-.2 1.5-.2z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 22c.7.6 1.8.6 2.5 0"
              stroke={avatar.iconStroke}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M29 18l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"
              fill={avatar.accentDot}
              stroke={avatar.iconStroke}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        )}

        {avatar.id === "sprout" && (
          // Little Sprout of Life
          <g>
            <path
              d="M24 38c0-7.5.5-13.5 3-17"
              stroke={avatar.iconStroke}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M25 24.5c-4.5-5.5-11.5-4-13.5 2.5 5 3.5 11.5 1 13.5-2.5z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26.5 20.5c5-4.5 11.5-3 12.5 3-5 2.5-10.5 0-12.5-3z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="13.5" r="1.8" fill={avatar.accentDot} />
          </g>
        )}

        {avatar.id === "heart" && (
          // Heart in Hands
          <g>
            <path
              d="M24 30.5s-7.5-4.5-7.5-9.5a4.5 4.5 0 0 1 7.5-3.2 4.5 4.5 0 0 1 7.5 3.2c0 5-7.5 9.5-7.5 9.5z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 29c3 3.5 6.5 6.5 10.5 6.5s7.5-3 10.5-6.5"
              stroke={avatar.iconStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="19.5" r="1.8" fill={avatar.accentDot} />
          </g>
        )}

        {avatar.id === "butterfly" && (
          // Sweet Butterfly
          <g>
            <path
              d="M24 22c-2-6-9-7-11-2 1 5.5 7 5.5 11 2zM24 22c2-6 9-7 11-2-1 5.5-7 5.5-11 2z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M24 23c-2 3.5-6.5 5.5-7.5 2 0-3.5 4.5-3.5 7.5-2zM24 23c2 3.5 6.5 5.5 7.5 2 0-3.5-4.5-3.5-7.5-2z"
              fill={avatar.iconFill}
              stroke={avatar.iconStroke}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M22 17c-1-1.8-2.5-2.5-3.5-1.8M26 17c1-1.8 2.5-2.5 3.5-1.8"
              stroke={avatar.iconStroke}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
