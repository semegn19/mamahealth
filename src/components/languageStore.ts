import { useEffect, useState } from "react";

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

function readLanguage(): LanguageCode {
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
