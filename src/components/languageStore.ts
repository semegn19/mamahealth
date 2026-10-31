"use client";

import { useSyncExternalStore } from "react";
import en from "../locales/en.json";
import am from "../locales/am.json";

export type LanguageCode = "en" | "am";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "am", label: "Amharic", nativeLabel: "አማርኛ" },
];

const STORAGE_KEY = "mama-health-language-v1";
const LEGACY_STORAGE_KEY = "aurelia-language-v1";
const CHANGE_EVENT = "mama-health-language-change";

const DICTIONARIES: Record<LanguageCode, Record<string, any>> = {
  en,
  am,
};

function readLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved === "en" || saved === "am") return saved;
  } catch {
    // Ignore storage read errors.
  }
  return "en";
}

function writeLanguage(code: LanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Ignore storage write errors.
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
  }
  window.dispatchEvent(new CustomEvent<LanguageCode>(CHANGE_EVENT, { detail: code }));
}

function subscribeLanguage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLanguage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    readLanguage,
    () => "en" as LanguageCode,
  );

  const setLanguage = (next: LanguageCode) => {
    writeLanguage(next);
  };

  const currentOption =
    LANGUAGE_OPTIONS.find((item) => item.code === language) ?? LANGUAGE_OPTIONS[0];

  return {
    language,
    currentOption,
    options: LANGUAGE_OPTIONS,
    setLanguage,
  };
}

export function useTranslation() {
  const { language, setLanguage, currentOption, options } = useLanguage();

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let current: any = DICTIONARIES[language];
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation key is missing in active language
        let fallback: any = DICTIONARIES.en;
        for (const fKey of keys) {
          if (fallback && typeof fallback === "object" && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== "string") {
      return path;
    }

    if (params) {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`{${k}}`, "g"), String(v));
      }, current);
    }

    return current;
  };

  return {
    t,
    language,
    isAmharic: language === "am",
    setLanguage,
    currentOption,
    options,
  };
}
