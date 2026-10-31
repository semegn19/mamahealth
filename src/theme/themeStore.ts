import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

const STORAGE_KEY = "mama-health-theme-v1";
const LEGACY_STORAGE_KEY = "aurelia-theme-v1";
const CHANGE_EVENT = "mama-health-theme-change";

type ViewTransitionLike = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type DocumentWithVT = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

export type ThemeOrigin =
  | { x: number; y: number }
  | { currentTarget: HTMLElement | null; clientX?: number; clientY?: number }
  | HTMLElement
  | null
  | undefined;

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    // Storage may be blocked; fall back to DOM or light.
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyDomTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.dataset.theme = "dark";
  } else {
    root.classList.remove("dark");
    root.dataset.theme = "light";
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#15120e" : "#f3ecdf");
  }
}

function resolveOriginPoint(origin?: ThemeOrigin): { x: number; y: number } {
  const fallback = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 3,
  };
  if (!origin) return fallback;

  if ("x" in origin && typeof origin.x === "number" && typeof origin.y === "number") {
    return origin;
  }

  if (origin instanceof HTMLElement) {
    const rect = origin.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  if ("currentTarget" in origin) {
    if (
      typeof origin.clientX === "number" &&
      typeof origin.clientY === "number" &&
      (origin.clientX !== 0 || origin.clientY !== 0)
    ) {
      return { x: origin.clientX, y: origin.clientY };
    }
    if (origin.currentTarget) {
      const rect = origin.currentTarget.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }

  return fallback;
}

function spawnGoldenAuraWave(x: number, y: number, endRadius: number, toDark: boolean) {
  const ring = document.createElement("div");
  ring.setAttribute("aria-hidden", "true");
  ring.className = `theme-aura-wave ${toDark ? "is-to-dark" : "is-to-light"}`;
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.width = `${endRadius * 2}px`;
  ring.style.height = `${endRadius * 2}px`;
  document.body.appendChild(ring);

  const animation = ring.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.02)", opacity: 0.95 },
      { transform: "translate(-50%, -50%) scale(0.55)", opacity: 0.85, offset: 0.45 },
      { transform: "translate(-50%, -50%) scale(1.06)", opacity: 0 },
    ],
    {
      duration: 820,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  );

  animation.finished
    .catch(() => {})
    .finally(() => {
      ring.remove();
    });
}

function commitTheme(next: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage write errors.
  }
  applyDomTheme(next);
  window.dispatchEvent(new CustomEvent<Theme>(CHANGE_EVENT, { detail: next }));
}

export function setThemeWithTransition(next: Theme, origin?: ThemeOrigin) {
  const current = readStoredTheme();
  if (current === next) return;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof document === "undefined") {
    commitTheme(next);
    return;
  }

  const { x, y } = resolveOriginPoint(origin);
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const toDark = next === "dark";
  const doc = document as DocumentWithVT;

  if (typeof doc.startViewTransition === "function") {
    const root = document.documentElement;
    root.dataset.themeVt = "active";

    const vt = doc.startViewTransition(() => {
      flushSync(() => {
        commitTheme(next);
      });
    });

    vt.ready
      .then(() => {
        spawnGoldenAuraWave(x, y, endRadius, toDark);
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 780,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        // View transition interrupted; theme is already applied.
      });

    vt.finished
      .catch(() => {})
      .finally(() => {
        delete root.dataset.themeVt;
      });
    return;
  }

  // Smooth CSS fallback when View Transitions API isn't supported.
  const root = document.documentElement;
  root.classList.add("theme-smooth-transition");
  spawnGoldenAuraWave(x, y, endRadius, toDark);
  commitTheme(next);
  window.setTimeout(() => {
    root.classList.remove("theme-smooth-transition");
  }, 780);
}

/** Shared reactive theme hook. */
export function useTheme() {
  // The pre-paint script has already put the right palette on <html>; React
  // starts from "light" so SSR and hydration match, then syncs on mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyDomTheme(stored);

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Theme>).detail;
      if (next === "dark" || next === "light") {
        setThemeState(next);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const next = readStoredTheme();
        applyDomTheme(next);
        setThemeState(next);
      }
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = (next: Theme, origin?: ThemeOrigin) => {
    setThemeWithTransition(next, origin);
  };

  const toggleTheme = (origin?: ThemeOrigin) => {
    setThemeWithTransition(theme === "dark" ? "light" : "dark", origin);
  };

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
  };
}
