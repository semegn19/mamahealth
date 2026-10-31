import { useSyncExternalStore } from "react";

/** A hand-entered supplement answer for today. */
export type SupplementLog = {
  id: string;
  name: string;
  taken: boolean;
};

/** One hand-entered food-group log, saved per day. */
export type FoodLog = {
  /** Local date key, "YYYY-MM-DD". */
  date: string;
  /** Indices into FOOD_GROUPS. */
  groups: number[];
  savedAt: string;
};

const SUPPLEMENT_KEY = "mama-health-manual-supplements-v1";
const LEGACY_SUPPLEMENT_KEY = "aurelia-manual-supplements-v1";
const FOOD_KEY = "mama-health-manual-food-v1";
const LEGACY_FOOD_KEY = "aurelia-manual-food-v1";

const SUPPLEMENT_CHANGE = "mama-health-manual-supplements-change";
const FOOD_CHANGE = "mama-health-manual-food-change";

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

let cachedRawSupplements: string | null = null;
let cachedSupplements: SupplementLog[] = [];

function readSupplements(): SupplementLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUPPLEMENT_KEY) ?? localStorage.getItem(LEGACY_SUPPLEMENT_KEY);
    if (raw === cachedRawSupplements) {
      return cachedSupplements;
    }
    cachedRawSupplements = raw;
    if (!raw) {
      cachedSupplements = [];
      return cachedSupplements;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedSupplements = parsed as SupplementLog[];
      return cachedSupplements;
    }
  } catch {
    // Ignore storage failures.
  }
  cachedSupplements = [];
  return cachedSupplements;
}

let cachedRawFood: string | null = null;
let cachedFood: FoodLog[] = [];

function readFood(): FoodLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOOD_KEY) ?? localStorage.getItem(LEGACY_FOOD_KEY);
    if (raw === cachedRawFood) {
      return cachedFood;
    }
    cachedRawFood = raw;
    if (!raw) {
      cachedFood = [];
      return cachedFood;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedFood = parsed as FoodLog[];
      return cachedFood;
    }
  } catch {
    // Ignore storage failures.
  }
  cachedFood = [];
  return cachedFood;
}

function subscribeSupplements(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedRawSupplements = null;
    callback();
  };
  window.addEventListener(SUPPLEMENT_CHANGE, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SUPPLEMENT_CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

function subscribeFood(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedRawFood = null;
    callback();
  };
  window.addEventListener(FOOD_CHANGE, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(FOOD_CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Saved-by-hand supplement answers for today. Shared across the app. */
export function useManualSupplements() {
  const items = useSyncExternalStore(
    subscribeSupplements,
    readSupplements,
    () => [],
  );

  const save = (next: SupplementLog[]) => {
    const raw = JSON.stringify(next);
    try {
      localStorage.setItem(SUPPLEMENT_KEY, raw);
    } catch {
      // In-memory state still works.
    }
    cachedRawSupplements = raw;
    cachedSupplements = next;
    window.dispatchEvent(new CustomEvent(SUPPLEMENT_CHANGE, { detail: next }));
  };

  return { items, save };
}

/** Hand-logged food groups, one entry per day (latest overwrites the day). */
export function useManualFood() {
  const items = useSyncExternalStore(
    subscribeFood,
    readFood,
    () => [],
  );

  const save = (groups: number[]) => {
    const entry: FoodLog = {
      date: todayKey(),
      groups: [...groups].sort((a, b) => a - b),
      savedAt: new Date().toISOString(),
    };
    const next = [...items.filter((item) => item.date !== entry.date), entry];
    const raw = JSON.stringify(next);
    try {
      localStorage.setItem(FOOD_KEY, raw);
    } catch {
      // In-memory state still works.
    }
    cachedRawFood = raw;
    cachedFood = next;
    window.dispatchEvent(new CustomEvent(FOOD_CHANGE, { detail: next }));
  };

  return { items, save };
}
