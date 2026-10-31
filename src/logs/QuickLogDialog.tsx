import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Apple,
  Beef,
  Carrot,
  Check,
  ChevronLeft,
  Milk,
  Pill,
  Save,
  UtensilsCrossed,
  Wheat,
  X,
} from "lucide-react";
import { useProfile } from "../settings/profileStore";
import { useManualFood, useManualSupplements } from "./quickLogStore";

/** Food groups used by the hand log (kept in sync with the ANC report). */
export const FOOD_GROUPS_FOR_LOG = [
  { name: "Grains", Icon: Wheat },
  { name: "Protein", Icon: Beef },
  { name: "Dairy", Icon: Milk },
  { name: "Fruit", Icon: Apple },
  { name: "Vegetables", Icon: Carrot },
] as const;

type Screen = "choose" | "supplements" | "food" | "saved";

export function QuickLogDialog({
  open,
  onClose,
  initialScreen = "choose",
}: {
  open: boolean;
  onClose: () => void;
  initialScreen?: Exclude<Screen, "saved">;
}) {
  const { profile } = useProfile();
  const { items: savedSupplements, save: saveSupplements } = useManualSupplements();
  const { save: saveFood } = useManualFood();

  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [groups, setGroups] = useState<number[]>([]);
  const [savedSummary, setSavedSummary] = useState("");
  const [error, setError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const suppressFocusRestore = useRef(false);
  const profileSupplementsRef = useRef(profile.supplements);
  const savedSupplementsRef = useRef(savedSupplements);
  profileSupplementsRef.current = profile.supplements;
  savedSupplementsRef.current = savedSupplements;

  const supplements = useMemo(
    () =>
      profile.supplements.length > 0
        ? profile.supplements
        : [
            { id: "iron", name: "Iron", reminderTime: "" },
            { id: "calcium", name: "Calcium", reminderTime: "" },
          ],
    [profile.supplements],
  );

  // Reset once per opening, and preselect anything already saved today.
  useEffect(() => {
    if (!open) return;
    const profileSupplements = profileSupplementsRef.current;
    const alreadySaved = savedSupplementsRef.current;
    setScreen(initialScreen);
    setError("");
    setSavedSummary("");
    setAnswers(
      Object.fromEntries(
        profileSupplements
          .filter((supplement) => alreadySaved.some((saved) => saved.id === supplement.id))
          .map((supplement) => [
            supplement.id,
            alreadySaved.find((saved) => saved.id === supplement.id)?.taken ?? false,
          ]),
      ),
    );
    setGroups([]);
  }, [open, initialScreen]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (!suppressFocusRestore.current) restoreFocusRef.current?.focus?.();
      suppressFocusRestore.current = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const controls = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const saveSupplementAnswers = () => {
    const unanswered = supplements.filter((supplement) => answers[supplement.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Answer yes or no for ${unanswered.map((s) => s.name).join(" and ")}.`);
      return;
    }
    const next = supplements.map((supplement) => ({
      id: supplement.id,
      name: supplement.name,
      taken: answers[supplement.id] === true,
    }));
    saveSupplements(next);
    const taken = next.filter((item) => item.taken).length;
    setSavedSummary(
      taken === next.length
        ? `${next.map((item) => item.name).join(" and ")} recorded as taken.`
        : `${taken} of ${next.length} supplements marked as taken.`,
    );
    setScreen("saved");
  };

  const saveFoodAnswers = () => {
    if (groups.length === 0) {
      setError("Choose at least one food group you ate today.");
      return;
    }
    saveFood(groups);
    setSavedSummary(
      `${groups.length} of ${FOOD_GROUPS_FOR_LOG.length} food groups logged: ${groups
        .map((index) => FOOD_GROUPS_FOR_LOG[index].name)
        .join(", ")}.`,
    );
    setScreen("saved");
  };

  const finish = () => {
    suppressFocusRestore.current = true;
    onClose();
  };

  const goBack = () => {
    if (screen === "saved") {
      finish();
      return;
    }
    setError("");
    setScreen("choose");
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-log-title"
      className="fixed inset-0 z-[100] isolate flex items-end justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#3b3226]/30 dark:bg-black/72 backdrop-blur-md"
      />
      <div
        ref={panelRef}
        className="report-sheet relative max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-[30px] border border-white/80 bg-[#fbf6ec]/[0.98] p-6 shadow-[0_18px_60px_-20px_rgba(85,55,18,0.5)] backdrop-blur-xl dark:border-[#e5be79]/22 dark:bg-[#221c15]/[0.98] dark:shadow-[0_24px_64px_-18px_rgba(0,0,0,0.88)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          {screen !== "choose" && screen !== "saved" ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Back to log options"
              className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </button>
          ) : (
            <span aria-hidden="true" className="h-10 w-10 shrink-0" />
          )}
          <h2
            id="quick-log-title"
            className="mt-2 flex-1 text-center text-[22px] font-medium leading-snug tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
          >
            {screen === "choose" && "Log by hand"}
            {screen === "supplements" && "Did you take your supplements?"}
            {screen === "food" && "What did you eat today?"}
            {screen === "saved" && "Saved"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close log"
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] active:scale-95"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        {screen === "choose" && (
          <div className="mt-6 space-y-3">
            <p className="text-center text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              What would you like to log today?
            </p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setScreen("supplements");
              }}
              className="home-card-solid group flex w-full items-center gap-3.5 rounded-[22px] px-4 py-4 text-left transition hover:border-[#c9a35d] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:hover:border-[#e5be79]/55 dark:focus-visible:outline-[#e5be79]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe7b8] text-[#6f5a35] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                <Pill size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                  Log supplements
                </span>
                <span className="mt-0.5 block text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                  Yes or no for each one
                </span>
              </span>
              <ChevronLeft
                size={17}
                className="rotate-180 shrink-0 text-[#a2937a] dark:text-[#9c8b72]"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setScreen("food");
              }}
              className="home-card-solid group flex w-full items-center gap-3.5 rounded-[22px] px-4 py-4 text-left transition hover:border-[#c9a35d] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:hover:border-[#e5be79]/55 dark:focus-visible:outline-[#e5be79]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9ab5e]/20 text-[#7b5b2b] dark:bg-[#e5be79]/15 dark:text-[#e5be79]">
                <UtensilsCrossed size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                  Log food
                </span>
                <span className="mt-0.5 block text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                  Pick the food groups you ate
                </span>
              </span>
              <ChevronLeft
                size={17}
                className="rotate-180 shrink-0 text-[#a2937a] dark:text-[#9c8b72]"
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {screen === "supplements" && (
          <div className="mt-5">
            <p className="text-center text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              Tap yes or no for each supplement.
            </p>
            <ul className="mt-4 space-y-2.5">
              {supplements.map((supplement) => {
                const value = answers[supplement.id];
                return (
                  <li
                    key={supplement.id}
                    className="rounded-[20px] border border-white/70 bg-white/65 px-4 py-3.5 backdrop-blur-sm dark:border-[#3d3123] dark:bg-[#19140f]/85"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbe7b8]/80 text-[#6f5a35] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                          <Pill size={16} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="text-[15px] font-medium capitalize text-[#3b3226] dark:text-[#f5ede0]">
                          {supplement.name}
                        </span>
                      </span>
                      <div
                        className="flex shrink-0 gap-1.5"
                        role="group"
                        aria-label={`${supplement.name} taken today?`}
                      >
                        {[
                          { label: "Yes", taken: true },
                          { label: "No", taken: false },
                        ].map((option) => {
                          const active = value === option.taken;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                setAnswers((current) => ({
                                  ...current,
                                  [supplement.id]: option.taken,
                                }));
                                setError("");
                              }}
                              className={`min-h-10 min-w-[58px] rounded-full px-3.5 text-[13.5px] font-medium transition-colors ${
                                active
                                  ? option.taken
                                    ? "bg-[#4a3f30] text-[#fffaf0] dark:bg-[#e5be79] dark:text-[#231b12]"
                                    : "bg-[#9c3a29] text-[#fff7f2] dark:bg-[#c65a45]"
                                  : "border border-[#d8c6a4] bg-white/80 text-[#6f6149] hover:bg-white dark:border-[#4a3c2c] dark:bg-[#231c15] dark:text-[#c7b69c] dark:hover:bg-[#2d241b]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-[#9c3a29] dark:text-[#f08b75]">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={saveSupplementAnswers}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              Complete
            </button>
          </div>
        )}

        {screen === "food" && (
          <div className="mt-5">
            <p className="text-center text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              Select every food group you ate today.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5" role="group" aria-label="Food groups">
              {FOOD_GROUPS_FOR_LOG.map((group, index) => {
                const active = groups.includes(index);
                return (
                  <button
                    key={group.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setGroups((current) =>
                        current.includes(index)
                          ? current.filter((value) => value !== index)
                          : [...current, index].sort((a, b) => a - b),
                      );
                      setError("");
                    }}
                    className={`flex min-h-[64px] items-center gap-2.5 rounded-[18px] border px-3.5 py-3 text-left transition-colors ${
                      active
                        ? "border-[#c9a35d] bg-[#fbe7b8]/80 dark:border-[#e5be79] dark:bg-[#e5be79]/18"
                        : "border-white/70 bg-white/60 hover:bg-white/85 dark:border-[#3d3123] dark:bg-[#19140f]/80 dark:hover:bg-[#241d15]"
                    } ${group.name === "Vegetables" ? "col-span-2" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? "bg-[#4a3f30] text-[#fbe7b8] dark:bg-[#e5be79] dark:text-[#231b12]"
                          : "bg-[#d9ab5e]/15 text-[#7b5b2b] dark:bg-[#e5be79]/15 dark:text-[#e5be79]"
                      }`}
                    >
                      <group.Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                      {group.name}
                    </span>
                    {active && (
                      <Check
                        size={17}
                        strokeWidth={2.2}
                        className="shrink-0 text-[#6f5a35] dark:text-[#e5be79]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-[#9c3a29] dark:text-[#f08b75]">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={saveFoodAnswers}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              Complete
            </button>
          </div>
        )}

        {screen === "saved" && (
          <div className="mt-6 text-center" role="status" aria-live="polite">
            <span className="danger-alert-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4a3f30] text-[#fbe7b8] dark:bg-[#e5be79] dark:text-[#231b12]">
              <Save size={26} strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="mt-3 text-[16px] font-semibold text-[#3b3226] dark:text-[#f5ede0]">
              Your log is saved
            </p>
            <p className="mx-auto mt-1 max-w-[36ch] text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#c7b69c]">
              {savedSummary}
            </p>
            <p className="mx-auto mt-2 max-w-[36ch] text-[12px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
              It will be included in your next ANC report.
            </p>
            <button
              type="button"
              onClick={finish}
              className="mt-5 min-h-12 w-full rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => {
                setSavedSummary("");
                setError("");
                setScreen("choose");
              }}
              className="mt-2 min-h-11 w-full rounded-full px-6 text-[13.5px] font-medium text-[#6f5a35] underline decoration-[#b98a3e]/50 underline-offset-4 transition hover:text-[#3b3226] dark:text-[#dfb870] dark:hover:text-[#f5ede0]"
            >
              Log something else
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
