"use client";

import { useEffect, useState } from "react";
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

export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    setLanguageState(readLanguage());
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<LanguageCode>).detail;
      if (next === "en" || next === "am") setLanguageState(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setLanguageState(readLanguage());
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next);
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
