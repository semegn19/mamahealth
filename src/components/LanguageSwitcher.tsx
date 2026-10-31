import { useEffect, useId, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useLanguage } from "./languageStore";

/** Language control shared by the home, report, and settings headers. */
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { language, currentOption, options, setLanguage } = useLanguage();
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Switch language, currently ${currentOption.label}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="home-icon-solid relative flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#dfb870]"
      >
        <Globe size={19} strokeWidth={1.8} aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3b3226] px-1 text-[10px] font-semibold leading-none text-[#fbe7b8] ring-2 ring-white dark:bg-[#e5be79] dark:text-[#231b12] dark:ring-[#221c15]"
        >
          {language === "am" ? "አ" : "E"}
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Language settings"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 rounded-[22px] border border-white/85 bg-[#fffaf0]/95 p-3.5 text-[#3b3226] shadow-[0_16px_40px_-14px_rgba(88,59,20,0.27)] backdrop-blur-xl dark:border-[#e5be79]/22 dark:bg-[#231c15]/96 dark:text-[#f5ede0] dark:shadow-[0_20px_48px_-14px_rgba(0,0,0,0.75)]"
        >
          <p className="px-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#8d6a2a] dark:text-[#dfb870]">
            Language · ቋንቋ
          </p>
          <ul role="listbox" aria-label="Choose language" className="mt-2.5 space-y-1.5">
            {options.map((opt) => {
              const selected = opt.code === language;
              return (
                <li key={opt.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(opt.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "bg-[#f7ecd4] text-[#3b3226] dark:bg-[#e5be79]/20 dark:text-[#f7efe0] ring-1 ring-[#c9a35d]/45 dark:ring-[#e5be79]/40"
                        : "text-[#4a3f30] hover:bg-[#f7ecd4]/55 dark:text-[#d8c7ab] dark:hover:bg-white/6"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="text-[14px] font-medium leading-snug">
                        {opt.code === "am" ? "አማርኛ" : opt.label}
                      </span>
                      <span className="text-[11.5px] text-[#85735a] dark:text-[#9c8b72]">
                        {opt.code === "am" ? "Amharic" : "Default"}
                      </span>
                    </span>
                    {selected && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] dark:bg-[#e5be79] dark:text-[#231b12]">
                        <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
