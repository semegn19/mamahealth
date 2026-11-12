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

const SUPPLEMENT_CHANGE = "mama-health-manual-supplements-change";
const FOOD_CHANGE = "mama-health-manual-food-change";

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

let cachedSupplements: SupplementLog[] = [];

function readSupplements(): SupplementLog[] {
  return cachedSupplements;
}

let cachedFood: FoodLog[] = [];

function readFood(): FoodLog[] {
  return cachedFood;
}

function subscribeSupplements(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    callback();
  };
  window.addEventListener(SUPPLEMENT_CHANGE, handler);
  return () => {
    window.removeEventListener(SUPPLEMENT_CHANGE, handler);
  };
}

function subscribeFood(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    callback();
  };
  window.addEventListener(FOOD_CHANGE, handler);
  return () => {
    window.removeEventListener(FOOD_CHANGE, handler);
  };
}

const EMPTY_SUPPLEMENTS: SupplementLog[] = [];
const getSupplementsServerSnapshot = () => EMPTY_SUPPLEMENTS;

const EMPTY_FOOD: FoodLog[] = [];
const getFoodServerSnapshot = () => EMPTY_FOOD;

/** Saved-by-hand supplement answers for today. Shared across the app in-memory. */
export function useManualSupplements() {
  const items = useSyncExternalStore(
    subscribeSupplements,
    readSupplements,
    getSupplementsServerSnapshot,
  );

  const save = (next: SupplementLog[]) => {
    cachedSupplements = next;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT_SAFE, { detail: next }));
    }
  };

  return { items, save };
}

const CHANGE_EVENT_SAFE = SUPPLEMENT_CHANGE;

/** Hand-logged food groups, one entry per day (latest overwrites the day). Shared in-memory. */
export function useManualFood() {
  const items = useSyncExternalStore(
    subscribeFood,
    readFood,
    getFoodServerSnapshot,
  );

  const save = (groups: number[]) => {
    const entry: FoodLog = {
      date: todayKey(),
      groups: [...groups].sort((a, b) => a - b),
      savedAt: new Date().toISOString(),
    };
    const next = [...items.filter((item) => item.date !== entry.date), entry];
    cachedFood = next;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(FOOD_CHANGE, { detail: next }));
    }
  };

  return { items, save };
}
