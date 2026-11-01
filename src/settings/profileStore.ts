import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* A tiny shared profile/settings store, persisted to localStorage so  */
/* changes (like the name) show across the app immediately.            */
/* ------------------------------------------------------------------ */

export type Supplement = {
  id: string;
  name: string;
  /** Daily reminder time in 24h "HH:MM", or "" if no reminder is set. */
  reminderTime: string;
};

export type Profile = {
  name: string;
  email: string;
  nextAncDate: string; // "YYYY-MM-DD" or ""
  supplements: Supplement[];
};

const KEY = "mama-health-profile-v1";
const LEGACY_KEY = "aurelia-profile-v1";
const CHANGE_EVENT = "mama-health-profile-change";

import { MOCK_DEFAULT_PROFILE } from "../mock/profile";

export const DEFAULT_PROFILE: Profile = MOCK_DEFAULT_PROFILE;

let cachedRawProfile: string | null = null;
let cachedProfile: Profile = DEFAULT_PROFILE;

function getProfileSnapshot(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw === cachedRawProfile) {
      return cachedProfile;
    }
    cachedRawProfile = raw;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Profile>;
      cachedProfile = {
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : DEFAULT_PROFILE.name,
        email: typeof parsed.email === "string" && parsed.email.trim() ? parsed.email.trim() : DEFAULT_PROFILE.email,
        nextAncDate: typeof parsed.nextAncDate === "string" ? parsed.nextAncDate : DEFAULT_PROFILE.nextAncDate,
        supplements: Array.isArray(parsed.supplements)
          ? (parsed.supplements as Supplement[])
          : DEFAULT_PROFILE.supplements,
      };
      return cachedProfile;
    }
  } catch {
    // Storage may be unavailable; fall back to defaults.
  }
  cachedProfile = DEFAULT_PROFILE;
  return cachedProfile;
}

function write(profile: Profile) {
  const raw = JSON.stringify(profile);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // Ignore write failures; in-memory state still updates.
  }
  cachedRawProfile = raw;
  cachedProfile = profile;
  // Let every hook instance on the page know.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: profile }));
}

function subscribeProfile(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedRawProfile = null;
    callback();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Shared profile state. All components using this hook stay in sync. */
export function useProfile() {
  const profile = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    () => DEFAULT_PROFILE,
  );

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    write(next);
  };

  const resetAll = () => {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // Ignore.
    }
    cachedRawProfile = null;
    cachedProfile = DEFAULT_PROFILE;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: DEFAULT_PROFILE }));
  };

  return { profile, update, resetAll };
}
