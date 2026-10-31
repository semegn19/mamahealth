import { useEffect, useState } from "react";

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

export const DEFAULT_PROFILE: Profile = {
  name: "Amara Bennett",
  email: "amara.bennett@example.com",
  nextAncDate: "2025-10-09",
  supplements: [
    { id: "iron", name: "Iron", reminderTime: "08:00" },
    { id: "folic-acid", name: "Folic acid", reminderTime: "08:00" },
  ],
};

function read(): Profile {
  try {
    const saved = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Profile>;
      return {
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : DEFAULT_PROFILE.name,
        email: typeof parsed.email === "string" && parsed.email.trim() ? parsed.email.trim() : DEFAULT_PROFILE.email,
        nextAncDate: typeof parsed.nextAncDate === "string" ? parsed.nextAncDate : DEFAULT_PROFILE.nextAncDate,
        supplements: Array.isArray(parsed.supplements)
          ? (parsed.supplements as Supplement[])
          : DEFAULT_PROFILE.supplements,
      };
    }
  } catch {
    // Storage may be unavailable; fall back to defaults.
  }
  return DEFAULT_PROFILE;
}

function write(profile: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Ignore write failures; in-memory state still updates.
  }
  // Let every hook instance on the page know.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: profile }));
}

/** Shared profile state. All components using this hook stay in sync. */
export function useProfile() {
  // Start from the default profile so the server and the first client render
  // agree, then hydrate the saved profile once mounted.
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(read());
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Profile>).detail;
      if (next) setProfile(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) setProfile(read());
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    write(next);
  };

  const resetAll = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Ignore.
    }
    setProfile(DEFAULT_PROFILE);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: DEFAULT_PROFILE }));
  };

  return { profile, update, resetAll };
}
