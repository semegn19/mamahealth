import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* In-memory shared profile/settings store.                           */
/* All profile data is fetched directly from and saved to the backend. */
/* ------------------------------------------------------------------ */

export type Supplement = {
  id: string;
  name: string;
  /** Daily reminder time in 24h "HH:MM", or "" if no reminder is set. */
  reminderTime: string;
};

export type CalendarSystem = "ethiopian" | "gregorian";

export type Profile = {
  name: string;
  email: string;
  nextAncDate: string; // "YYYY-MM-DD" or ""
  supplements: Supplement[];
  hospital?: string;
  stageSummary?: string;
  calendarSystem?: CalendarSystem;
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
  trimester?: string;
  edd?: string;
  lnmpDate?: string;
  avatarIndex?: number;
};

const CHANGE_EVENT = "mama-health-profile-change";

export const DEFAULT_PROFILE: Profile = {
  name: "",
  email: "",
  nextAncDate: "",
  supplements: [],
  calendarSystem: "ethiopian",
};

let cachedProfile: Profile = DEFAULT_PROFILE;

function sanitizeText(val: unknown, mockVal: string): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed || trimmed.toLowerCase() === mockVal.toLowerCase()) return "";
  return trimmed;
}

function mergeProfiles(current: Profile, patch: Partial<Profile>): Profile {
  const cleanPatch: Partial<Profile> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (cleanPatch as any)[key] = value;
    }
  }
  const merged = { ...current, ...cleanPatch };
  return {
    ...merged,
    name: sanitizeText(merged.name, "Amara Bennett"),
    email: sanitizeText(merged.email, "amara.bennett@example.com"),
  };
}

function getProfileSnapshot(): Profile {
  return cachedProfile;
}

function write(profile: Profile) {
  const sanitized: Profile = {
    ...profile,
    name: sanitizeText(profile.name, "Amara Bennett"),
    email: sanitizeText(profile.email, "amara.bennett@example.com"),
  };
  cachedProfile = sanitized;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: sanitized }));
  }
}

function subscribeProfile(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    callback();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

/** Shared profile state. All components using this hook stay in sync in-memory. */
export function useProfile() {
  const profile = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    () => DEFAULT_PROFILE,
  );

  const update = (patch: Partial<Profile>) => {
    const next = mergeProfiles(profile, patch);
    write(next);
  };

  const resetAll = () => {
    cachedProfile = DEFAULT_PROFILE;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: DEFAULT_PROFILE }));
    }
  };

  return { profile, update, resetAll };
}

export function updateProfile(patch: Partial<Profile>) {
  const current = getProfileSnapshot();
  const next = mergeProfiles(current, patch);
  write(next);
}
