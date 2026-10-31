import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ThemeSelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

/**
 * A native-free select that matches the Mama Health theme: a compact pill trigger
 * plus a soft glass panel with a gold check on the active row. Native `<select>`
 * menus are drawn by the OS, so they can never pick up the app's palette — this
 * one is styled, keyboard accessible (arrows / Enter / Escape) and dismisses on
 * an outside click.
 */
export function ThemeSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  id,
  align = "right",
  className = "",
}: {
  value: T;
  options: ThemeSelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name for the trigger. */
  label: string;
  id?: string;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    // Focus the active row so arrow keys and Enter work straight away.
    const index = Math.max(
      0,
      options.findIndex((option) => option.value === value)
    );
    optionRefs.current[index]?.focus();

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
  }, [open, options, value]);

  const move = (from: number, step: number) => {
    const next = (from + step + options.length) % options.length;
    optionRefs.current[next]?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative shrink-0 ${className}`.trim()}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#d8c6a4] bg-white/90 py-1.5 pl-3 pr-2.5 text-[13px] font-medium text-[#3b3226] outline-none transition-colors hover:border-[#c9a35d] focus-visible:border-[#a87a3d] focus-visible:ring-2 focus-visible:ring-[#c9a35d]/30 dark:border-[#4a3c2c] dark:bg-[#221c15] dark:text-[#f5ede0] dark:hover:border-[#e5be79]/55 dark:focus-visible:border-[#e5be79] dark:focus-visible:ring-[#e5be79]/25"
      >
        <span className="whitespace-nowrap">{current?.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 text-[#85735a] transition-transform duration-200 dark:text-[#b9a88e] ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={panelId}
          role="listbox"
          aria-label={label}
          className={`absolute top-[calc(100%+8px)] z-50 w-[190px] rounded-[18px] border border-white/85 bg-[#fffaf0]/96 p-1.5 shadow-[0_16px_38px_-14px_rgba(88,59,20,0.3)] backdrop-blur-xl dark:border-[#e5be79]/22 dark:bg-[#231c15]/96 dark:shadow-[0_20px_44px_-14px_rgba(0,0,0,0.78)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="none">
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      move(index, 1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      move(index, -1);
                    }
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-[13px] px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79] ${
                    selected
                      ? "bg-[#f7ecd4] text-[#3b3226] ring-1 ring-[#c9a35d]/45 dark:bg-[#e5be79]/20 dark:text-[#f7efe0] dark:ring-[#e5be79]/40"
                      : "text-[#4a3f30] hover:bg-[#f7ecd4]/60 dark:text-[#d8c7ab] dark:hover:bg-white/6"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && (
                      <span className="mt-0.5 block text-[11px] font-normal text-[#85735a] dark:text-[#9c8b72]">
                        {option.hint}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <Check
                      size={14}
                      strokeWidth={2.4}
                      aria-hidden="true"
                      className="shrink-0 text-[#8d6a2a] dark:text-[#e5be79]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
