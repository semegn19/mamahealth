import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslation } from "../components/languageStore";
import { ModalDialog } from "../components/ModalDialog";
import { showToast } from "../components/toastStore";
import { usersApi, getAccessToken, useInvalidateQueries } from "../api";

/** Food groups used by the hand log (kept in sync with the ANC report). */
export const FOOD_GROUPS_FOR_LOG = [
  { name: "Grains", name_am: "እህል", Icon: Wheat },
  { name: "Protein", name_am: "ፕሮቲን", Icon: Beef },
  { name: "Dairy", name_am: "የወተት ተዋጽኦ", Icon: Milk },
  { name: "Fruit", name_am: "ፍራፍሬ", Icon: Apple },
  { name: "Vegetables", name_am: "አትክልት", Icon: Carrot },
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
  const { t, isAmharic } = useTranslation();
  const { profile } = useProfile();
  const { items: savedSupplements, save: saveSupplements } = useManualSupplements();
  const { save: saveFood } = useManualFood();

  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [groups, setGroups] = useState<number[]>([]);
  const [savedSummary, setSavedSummary] = useState("");
  const [error, setError] = useState("");
  const { invalidateCheckinHistory, invalidateUser } = useInvalidateQueries();

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
            { id: "iron", name: isAmharic ? "የብረት እንክብል" : "Iron", reminderTime: "" },
            { id: "calcium", name: isAmharic ? "ካልሲየም" : "Calcium", reminderTime: "" },
          ],
    [profile.supplements, isAmharic],
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

  if (!open) return null;

  const saveSupplementAnswers = async () => {
    const unanswered = supplements.filter((supplement) => answers[supplement.id] === undefined);
    if (unanswered.length > 0) {
      setError(
        t("quickLog.answerYesNoFor", {
          items: unanswered.map((s) => s.name).join(isAmharic ? " እና " : " and "),
        }),
      );
      return;
    }
    const next = supplements.map((supplement) => ({
      id: supplement.id,
      name: supplement.name,
      taken: answers[supplement.id] === true,
    }));

    if (getAccessToken()) {
      try {
        for (const item of next) {
          await usersApi.verifySupplement({
            supplement_id: item.id.includes("-") && item.id.length > 20 ? item.id : undefined,
            supplement_name: item.name,
            taken_today: item.taken,
          });
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to sync supplements with server", "error");
        return;
      }
      invalidateCheckinHistory();
      invalidateUser();
    }

    saveSupplements(next);

    const taken = next.filter((item) => item.taken).length;
    setSavedSummary(
      taken === next.length
        ? t("quickLog.allSupplementsTaken", {
            items: next.map((item) => item.name).join(isAmharic ? " እና " : " and "),
          })
        : t("quickLog.partSupplementsTaken", {
            taken,
            total: next.length,
          }),
    );
    showToast(t("quickLog.savedTitle"));
    setScreen("saved");
  };

  const saveFoodAnswers = async () => {
    if (groups.length === 0) {
      setError(t("quickLog.chooseAtLeastOneFood"));
      return;
    }
    const names = groups
      .map((index) =>
        isAmharic ? FOOD_GROUPS_FOR_LOG[index].name_am : FOOD_GROUPS_FOR_LOG[index].name,
      )
      .join(isAmharic ? "፣ " : ", ");

    if (getAccessToken()) {
      try {
        // Map food group indices to backend FoodGroup literal:
        // 0 -> grains, 1 -> proteins, 2 -> dairy, 3/4 -> fruits_and_vegetables
        const mappedGroups = new Set<"grains" | "proteins" | "dairy" | "fruits_and_vegetables">();
        for (const idx of groups) {
          if (idx === 0) mappedGroups.add("grains");
          else if (idx === 1) mappedGroups.add("proteins");
          else if (idx === 2) mappedGroups.add("dairy");
          else mappedGroups.add("fruits_and_vegetables");
        }
        await usersApi.verifyFood({
          food_groups: Array.from(mappedGroups),
          raw_text: names,
        });
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to sync food log with server", "error");
        return;
      }
      invalidateCheckinHistory();
    }

    saveFood(groups);

    setSavedSummary(
      t("quickLog.foodGroupsLogged", {
        count: groups.length,
        total: FOOD_GROUPS_FOR_LOG.length,
        items: names,
      }),
    );
    showToast(t("quickLog.savedTitle"));
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

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledBy="quick-log-title">
      <div
        ref={panelRef}
        className="report-sheet home-glass-warm relative max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[30px] p-6 pb-[max(28px,env(safe-area-inset-bottom))] sm:rounded-[30px]"
      >
        <div className="flex items-center justify-between gap-3">
          {screen !== "choose" && screen !== "saved" ? (
            <button
              type="button"
              onClick={goBack}
              aria-label={t("common.back")}
              className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </button>
          ) : (
            <span aria-hidden="true" className="h-10 w-10 shrink-0" />
          )}
          <h2
            id="quick-log-title"
            className="flex-1 text-center text-[24px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
          >
            {screen === "choose" && t("quickLog.title")}
            {screen === "supplements" && t("quickLog.didYouTakeSupplements")}
            {screen === "food" && t("quickLog.whatDidYouEat")}
            {screen === "saved" && t("quickLog.saved")}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] active:scale-95"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        {screen === "choose" && (
          <div className="mt-6 space-y-3">
            <p className="text-center text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              {t("quickLog.choosePrompt")}
            </p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setScreen("supplements");
              }}
              className="group flex w-full items-center gap-3.5 rounded-[22px] border border-[#d8c6a4]/60 bg-white/30 px-4 py-4 text-left backdrop-blur-sm transition hover:border-[#c9a35d] hover:bg-white/50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:border-[#4a3c2c]/70 dark:bg-white/[0.03] dark:hover:border-[#e5be79]/55 dark:hover:bg-white/[0.07] dark:focus-visible:outline-[#e5be79]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbe7b8] text-[#6f5a35] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                <Pill size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                  {t("quickLog.logSupplements")}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                  {t("quickLog.logSupplementsSub")}
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
              className="group flex w-full items-center gap-3.5 rounded-[22px] border border-[#d8c6a4]/60 bg-white/30 px-4 py-4 text-left backdrop-blur-sm transition hover:border-[#c9a35d] hover:bg-white/50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:border-[#4a3c2c]/70 dark:bg-white/[0.03] dark:hover:border-[#e5be79]/55 dark:hover:bg-white/[0.07] dark:focus-visible:outline-[#e5be79]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d9ab5e]/20 text-[#7b5b2b] dark:bg-[#e5be79]/15 dark:text-[#e5be79]">
                <UtensilsCrossed size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                  {t("quickLog.logFood")}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-[#85735a] dark:text-[#9c8b72]">
                  {t("quickLog.logFoodSub")}
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
              {t("quickLog.supplementPrompt")}
            </p>
            <div className="mt-4 space-y-3.5">
              {supplements.map((supplement) => {
                const value = answers[supplement.id];
                return (
                  <div
                    key={supplement.id}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fbe7b8]/80 text-[#6f5a35] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                        <Pill size={15} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <p className="text-[15px] font-medium capitalize text-[#3b3226] dark:text-[#f5ede0]">
                        {supplement.name}
                      </p>
                    </div>

                    <div
                      className="mt-3 grid grid-cols-2 gap-2.5"
                      role="group"
                      aria-label={`${supplement.name} taken today?`}
                    >
                      {[
                        { label: t("common.yes"), taken: true },
                        { label: t("common.no"), taken: false },
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
                            className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-[14.5px] font-medium transition-all duration-200 ${
                              active
                                ? "border-[#4a3f30] bg-[#4a3f30] text-[#fffaf0] shadow-[0_8px_20px_-10px_rgba(60,45,25,0.6)] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                                : "border-[#d8c6a4] bg-white/80 text-[#6f6149] hover:border-[#c9a35d] hover:bg-white dark:border-[#4a3c2c] dark:bg-[#231c15]/85 dark:text-[#c7b69c] dark:hover:border-[#e5be79]/55 dark:hover:bg-[#2c231a]"
                            }`}
                          >
                            {active && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
              onClick={saveSupplementAnswers}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              {t("quickLog.complete")}
            </button>
          </div>
        )}

        {screen === "food" && (
          <div className="mt-5">
            <p className="text-center text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              {t("quickLog.foodPrompt")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5" role="group" aria-label="Food groups">
              {FOOD_GROUPS_FOR_LOG.map((group, index) => {
                const active = groups.includes(index);
                const displayName = isAmharic ? group.name_am : group.name;

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
                      {displayName}
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
              {t("quickLog.complete")}
            </button>
          </div>
        )}

        {screen === "saved" && (
          <div className="mt-6 text-center" role="status" aria-live="polite">
            <span className="danger-alert-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4a3f30] text-[#fbe7b8] dark:bg-[#e5be79] dark:text-[#231b12]">
              <Save size={26} strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="mt-3 text-[16px] font-semibold text-[#3b3226] dark:text-[#f5ede0]">
              {t("quickLog.savedTitle")}
            </p>
            <p className="mx-auto mt-1 max-w-[36ch] text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#c7b69c]">
              {savedSummary}
            </p>
            <p className="mx-auto mt-2 max-w-[36ch] text-[12px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
              {t("quickLog.willBeIncluded")}
            </p>
            <button
              type="button"
              onClick={finish}
              className="mt-5 min-h-12 w-full rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
            >
              {t("quickLog.done")}
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
              {t("quickLog.logSomethingElse")}
            </button>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
