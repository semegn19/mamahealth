import { useEffect, useState } from "react";

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

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readSupplements(): SupplementLog[] {
  try {
    const raw = localStorage.getItem(SUPPLEMENT_KEY) ?? localStorage.getItem(LEGACY_SUPPLEMENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as SupplementLog[];
  } catch {
    // Ignore storage failures.
  }
  return [];
}

function readFood(): FoodLog[] {
  try {
    const raw = localStorage.getItem(FOOD_KEY) ?? localStorage.getItem(LEGACY_FOOD_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as FoodLog[];
  } catch {
    // Ignore storage failures.
  }
  return [];
}

function emit(name: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Saved-by-hand supplement answers for today. Shared across the app. */
export function useManualSupplements() {
  const [items, setItems] = useState<SupplementLog[]>([]);

  useEffect(() => {
    setItems(readSupplements());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<SupplementLog[]>).detail;
      if (Array.isArray(detail)) setItems(detail);
    };
    window.addEventListener("mama-health-manual-supplements-change", onChange);
    return () => window.removeEventListener("mama-health-manual-supplements-change", onChange);
  }, []);

  const save = (next: SupplementLog[]) => {
    setItems(next);
    try {
      localStorage.setItem(SUPPLEMENT_KEY, JSON.stringify(next));
    } catch {
      // In-memory state still works.
    }
    emit("mama-health-manual-supplements-change", next);
  };

  return { items, save };
}

/** Hand-logged food groups, one entry per day (latest overwrites the day). */
export function useManualFood() {
  const [items, setItems] = useState<FoodLog[]>([]);

  useEffect(() => {
    setItems(readFood());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<FoodLog[]>).detail;
      if (Array.isArray(detail)) setItems(detail);
    };
    window.addEventListener("mama-health-manual-food-change", onChange);
    return () => window.removeEventListener("mama-health-manual-food-change", onChange);
  }, []);

  const save = (groups: number[]) => {
    const entry: FoodLog = {
      date: todayKey(),
      groups: [...groups].sort((a, b) => a - b),
      savedAt: new Date().toISOString(),
    };
    const next = [...items.filter((item) => item.date !== entry.date), entry];
    setItems(next);
    try {
      localStorage.setItem(FOOD_KEY, JSON.stringify(next));
    } catch {
      // In-memory state still works.
    }
    emit("mama-health-manual-food-change", next);
  };

  return { items, save };
}
