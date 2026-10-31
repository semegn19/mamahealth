"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  FileText,
  Mic,
  Pause,
  PenLine,
  Phone,
  Siren,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CheckinReportSheet, severityLabel, type CheckinEntry } from "../components/CheckinReportSheet";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Sample check-in conversation (the prototype "hears" these)          */
/* ------------------------------------------------------------------ */

const UTTERANCES = [
  {
    prompt: "How are you feeling today?",
    answer: "A little tired, with a mild headache after lunch.",
  },
  {
    prompt: "Any symptoms since yesterday?",
    answer: "Some nausea in the mornings, but it has eased off.",
  },
  {
    prompt: "What did you eat today?",
    answer: "Oatmeal for breakfast, a chicken salad, and a glass of milk.",
  },
];

type Phase = "asking" | "listening" | "processing" | "review" | "editing" | "confirming";

type Response = CheckinEntry;

/**
 * Prototype-only simulated finding. A real build would derive this from the
 * check-in answers and triage rules, then route the user to urgent care.
 */
const SIMULATED_DANGER_SIGN = {
  name: "Severe headache with blurred vision",
  detail:
    "You described a headache lasting over 6 hours that rest hasn't eased, together with blurred vision.",
  severity: "Critical" as const,
};

/* ------------------------------------------------------------------ */
/* Voice orb: soft translucent gold discs orbiting a bright centre     */
/* ------------------------------------------------------------------ */

type OrbMode = "idle" | "speaking" | "listening" | "danger";

function VoiceOrb({ mode }: { mode: OrbMode }) {
  return (
    <div
      aria-hidden="true"
      className={`voice-orb ${
        mode === "listening"
          ? "is-listening"
          : mode === "speaking"
            ? "is-speaking"
            : mode === "danger"
              ? "is-danger"
              : ""
      }`}
      style={{ width: "min(230px, 28vh)", height: "min(230px, 28vh)" }}
    >
      <span className="voice-orb__bloom" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="voice-orb__petal">
          <span className="voice-orb__disc" />
        </span>
      ))}
      <span className="voice-orb__core" />
      {mode === "danger" && (
        <span className="danger-core-icon" aria-hidden="true">
          <AlertTriangle size={42} strokeWidth={2.1} />
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Animated words: the question types itself in, word by word          */
/* ------------------------------------------------------------------ */

function AnimatedWords({
  text,
  className = "",
  wordDelay = 130,
  onDone,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
  onDone?: () => void;
}) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= words.length) {
      onDoneRef.current?.();
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), count === 0 ? 250 : wordDelay);
    return () => window.clearTimeout(id);
  }, [count, words.length, wordDelay]);

  return (
    <p className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`inline-block transition-all duration-300 ${
            i < count ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {word}
          {"\u00A0"}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Processing state: question stays, shimmer lines + bouncing dots     */
/* ------------------------------------------------------------------ */

function ProcessingState() {
  return (
    <div
      className="mt-6 flex w-full flex-col items-center"
      role="status"
      aria-label="Understanding your words"
    >
      <div className="flex w-full max-w-[280px] flex-col gap-2.5">
        <div className="skeleton-line w-11/12" />
        <div className="skeleton-line w-3/4" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13.5px] text-[#85735a] dark:text-[#b9a88e]">
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="proc-dot" style={{ animationDelay: "0ms" }} />
          <span className="proc-dot" style={{ animationDelay: "150ms" }} />
          <span className="proc-dot" style={{ animationDelay: "300ms" }} />
        </span>
        Understanding your words…
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Severity slider                                                     */
/* ------------------------------------------------------------------ */

function SeveritySlider({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-5 w-full">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Severity, currently ${severityLabel(value)}`}
        className="severity-slider"
        style={{ ["--fill" as string]: `${value}%` } as React.CSSProperties}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-[#9b8a6f] dark:text-[#9c8b72]">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review card: the transcribed answer + "is that correct?" + severity */
/* ------------------------------------------------------------------ */

function ReviewCard({
  draft,
  editing,
  onDraftChange,
  severity,
  onSeverityChange,
  locked,
  saved,
}: {
  draft: string;
  editing: boolean;
  onDraftChange: (v: string) => void;
  severity: number;
  onSeverityChange: (v: number) => void;
  locked: boolean;
  saved: boolean;
}) {
  return (
    <div className="review-in mt-6 w-full text-center">
      {editing ? (
        <div>
          <label htmlFor="answer-edit" className="sr-only">
            Edit your transcribed answer
          </label>
          <textarea
            id="answer-edit"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-2xl border border-[#c9a35d]/60 bg-white px-4 py-3 text-left text-[16px] leading-relaxed text-[#3b3226] outline-none focus:border-[#8d6a2a] dark:border-[#e5be79]/50 dark:bg-[#1c1611] dark:text-[#f5ede0] dark:focus:border-[#e5be79]"
          />
          <p className="mt-2 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
            Fix any words, then hit confirm.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-[17px] font-medium leading-[1.45] text-[#3b3226] dark:text-[#f5ede0]">
            {draft}
          </p>
          <div className="mt-2 flex min-h-6 items-center justify-center">
            {saved ? (
              <span
                className="saved-answer flex items-center gap-2 text-[14px] font-medium text-[#8d6a2a] dark:text-[#e5be79]"
                role="status"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbe7b8] dark:bg-[#e5be79]/22">
                  <Check size={13} strokeWidth={2.4} />
                </span>
                Saved
              </span>
            ) : (
              <p className="text-[15px] text-[#6f6149] dark:text-[#c7b69c]">Is that correct?</p>
            )}
          </div>
        </div>
      )}

      <SeveritySlider value={severity} onChange={onSeverityChange} disabled={locked} />

      {!locked && !editing && (
        <p className="mt-4 text-[13px] text-[#85735a] dark:text-[#9c8b72]">
          Tap edit or re-record to change your answer.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Waveform: small gold bars that move while the app is listening      */
/* ------------------------------------------------------------------ */

function Waveform({ listening }: { listening: boolean }) {
  const bars = [0.5, 0.8, 1, 0.65, 0.9, 0.55, 0.75];
  return (
    <div className="flex h-10 items-center justify-center gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`block w-[3px] rounded-full bg-gradient-to-b from-[#e9bd78] to-[#b98a3e] ${
            listening ? "voice-bar" : ""
          }`}
          style={{
            height: `${h * 36}px`,
            transform: listening ? undefined : "scaleY(0.35)",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const STATUS: Record<Phase | "done", string> = {
  asking: "Tap record to begin",
  listening: "Listening...",
  processing: "Understanding...",
  review: "Review your answer",
  editing: "Editing",
  confirming: "Saving...",
  done: "Complete",
};

export function VoiceCheckin() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");
  const [draft, setDraft] = useState("");
  const [severity, setSeverity] = useState(50);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showReport, setShowReport] = useState(false);
  /** Prototype toggle: previews how a detected danger sign would be surfaced. */
  const [dangerSimulated, setDangerSimulated] = useState(false);
  /** True while the question text is animating in — i.e. the AI is speaking. */
  const [speaking, setSpeaking] = useState(true);
  const timers = useRef<number[]>([]);

  const completed = questionIndex >= UTTERANCES.length;
  const listening = phase === "listening";
  const question = !completed ? UTTERANCES[questionIndex] : null;

  // A new question means the AI starts speaking it again.
  useEffect(() => {
    setSpeaking(true);
  }, [questionIndex]);

  const orbMode: OrbMode =
    completed && dangerSimulated
      ? "danger"
      : listening
        ? "listening"
        : speaking && !completed && !leaving
          ? "speaking"
          : "idle";

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const goHome = () => {
    router.push("/home");
  };

  /** Start capturing an answer for the current question. */
  const startListening = () => {
    if (completed || leaving || phase === "confirming" || phase === "processing") return;
    clearTimers();
    setPhase("listening");
  };

  /** Stop capturing → brief processing → transcribed review card. */
  const stopListening = () => {
    if (phase !== "listening" || completed) return;
    setPhase("processing");
    later(() => {
      setDraft(UTTERANCES[questionIndex].answer);
      setSeverity(50);
      setPhase("review");
    }, 2100);
  };

  /** Skip stays inside the check-in: swipe to the next question. */
  const skipQuestion = () => {
    if (completed || leaving || phase === "confirming") return;
    clearTimers();
    if (question) {
      setResponses((items) => [
        ...items,
        { question: question.prompt, answer: null, severity: null, skipped: true },
      ]);
    }
    setLeaving(true);
    later(() => {
      setQuestionIndex((i) => i + 1);
      setDraft("");
      setSeverity(50);
      setPhase("asking");
      setLeaving(false);
    }, 320);
  };

  /** Confirm shows a saved state, then swipes to the next question. */
  const confirmAnswer = () => {
    if (phase !== "review" && phase !== "editing") return;
    if (question) {
      setResponses((items) => [
        ...items,
        { question: question.prompt, answer: draft, severity, skipped: false },
      ]);
    }
    setPhase("confirming");
    later(() => setLeaving(true), 750);
    later(() => {
      setQuestionIndex((i) => i + 1);
      setDraft("");
      setSeverity(50);
      setLeaving(false);
      setPhase("asking");
    }, 1080);
  };

  const toggleEdit = () => {
    if (phase === "review") setPhase("editing");
    else if (phase === "editing") setPhase("review");
  };

  /** Discard the transcription and listen again for the same question. */
  const reRecord = () => {
    if (phase !== "review") return;
    clearTimers();
    setDraft("");
    setPhase("listening");
  };

  const recordDisabled =
    completed || leaving || phase === "processing" || phase === "editing" || phase === "confirming";
  const inReview = phase === "review" || phase === "editing";
  const editDisabled = completed || leaving || !inReview;
  const rightIsConfirm = inReview || phase === "confirming";

  return (
    <div
      className={`relative flex min-h-[100dvh] w-full justify-center overflow-hidden text-[#3b3226] dark:text-[#f5ede0] ${
        completed && dangerSimulated
          ? "bg-gradient-to-b from-[#f6ece5] to-[#f4e4dc] dark:from-[#1e120f] dark:to-[#150f0d]"
          : "bg-[#f5efe3] dark:bg-[#15120e]"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {completed && dangerSimulated ? (
          <>
            <div className="absolute left-1/2 top-[8%] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[#d97762] opacity-12 blur-[120px] dark:opacity-18" />
            <div className="absolute -right-24 top-[40%] h-[300px] w-[300px] rounded-full bg-[#c65a45] opacity-8 blur-[120px] dark:opacity-14" />
            <div className="absolute bottom-[-80px] left-[20%] h-[280px] w-[280px] rounded-full bg-white opacity-60 blur-[100px] dark:bg-[#8f3021] dark:opacity-14" />
          </>
        ) : (
          <>
            <div className="absolute -left-24 top-[8%] h-[340px] w-[340px] rounded-full bg-[#f7dfb3] opacity-60 blur-[100px] dark:bg-[#c99642] dark:opacity-14" />
            <div className="absolute -right-24 top-[42%] h-[320px] w-[320px] rounded-full bg-[#e9bd78] opacity-30 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
            <div className="absolute bottom-[-80px] left-[20%] h-[280px] w-[280px] rounded-full bg-white opacity-80 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
          </>
        )}
      </div>

      <div className="relative flex min-h-[100dvh] w-full max-w-[440px] flex-col px-6 pb-8 pt-6">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={goHome}
            aria-label="Back to home"
            className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>

          <div className="text-center">
            <p className="text-[16px] font-medium tracking-tight">Voice check-in</p>
            <p className="mt-0.5 text-[13px] text-[#85735a] dark:text-[#9c8b72]" aria-live="polite">
              {completed ? STATUS.done : STATUS[phase]}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMuted((v) => !v)}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
            className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95"
          >
            {muted ? (
              <VolumeX size={20} strokeWidth={1.8} />
            ) : (
              <Volume2 size={20} strokeWidth={1.8} />
            )}
          </button>
        </header>

        {!completed && question && (
          <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
            {UTTERANCES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < questionIndex
                    ? "w-5 bg-[#c9a35d]"
                    : i === questionIndex
                      ? "w-8 bg-[#3b3226] dark:bg-[#e5be79]"
                      : "w-1.5 bg-[#d9c9a8] dark:bg-[#3d3123]"
                }`}
              />
            ))}
          </div>
        )}

        <main className="relative flex flex-1 flex-col items-center">
          {/* In the danger state the orb is hidden — the warning icon sits in its place, with the heading above it. */}
          {!(completed && dangerSimulated) && (
            <div className="mt-4 flex w-full items-center justify-center">
              <VoiceOrb mode={orbMode} />
            </div>
          )}

          <div className="mt-2 w-full flex-1">
            {completed ? (
              dangerSimulated ? (
                <div className="danger-alert-in w-full text-center">
                  <h2
                    id="danger-headline"
                    className="text-[25px] font-bold leading-[1.2] tracking-[-0.02em] text-[#63281d] dark:text-[#fde8e1]"
                  >
                    A danger sign was detected
                  </h2>
                  <div className="mt-7 flex justify-center" aria-hidden="true">
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <span className="absolute inset-3 rounded-full bg-[#d97762]/14 blur-2xl dark:bg-[#e07a64]/20" />
                      <span className="relative flex h-[74px] w-[74px] items-center justify-center">
                        <span className="danger-ring" />
                        <span className="danger-calm-breathe relative flex h-full w-full items-center justify-center rounded-full border border-[#c65a45]/30 bg-white/80 text-[#b54834] shadow-[0_10px_28px_-14px_rgba(181,72,52,0.3)] backdrop-blur-md dark:border-[#e4725c]/35 dark:bg-[#2c1713]/85 dark:text-[#f08b75] dark:shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)]">
                          <AlertTriangle size={29} strokeWidth={1.75} />
                        </span>
                      </span>
                    </div>
                  </div>
                  <p className="mx-auto mt-6 max-w-[40ch] text-[17px] font-semibold leading-snug text-[#63281d] dark:text-[#fde8e1]">
                    {SIMULATED_DANGER_SIGN.name}
                  </p>
                  <p className="mx-auto mt-2 max-w-[40ch] text-[15px] leading-relaxed text-[#7d2b1c] dark:text-[#f3bdb0]">
                    {SIMULATED_DANGER_SIGN.detail}
                  </p>
                  <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-semibold leading-relaxed text-[#63281d] dark:text-[#fde8e1]">
                    Please contact your doctor or midwife now — don&apos;t wait for your next
                    appointment.
                  </p>
                  <ul className="mx-auto mt-4 max-w-[42ch] space-y-1.5 text-left text-[14px] leading-relaxed text-[#8d3d2b] dark:text-[#eab0a2]">
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      If you feel very unwell, have trouble seeing, or are in pain, seek urgent care.
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      Ask someone to stay with you until you have spoken to a clinician.
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c65a45] dark:bg-[#e87962]"
                      />
                      Your answers are saved and ready to share with your care team.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="rise w-full text-center" role="status">
                  <p className="text-[18px] leading-snug text-[#85735a] dark:text-[#b9a88e]">
                    All done for today.
                  </p>
                  <p className="mt-3 text-[25px] font-bold leading-[1.2] tracking-[-0.02em]">
                    You&apos;ve reached the end of today&apos;s questions.
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
                    Return home whenever you&apos;re ready.
                  </p>
                </div>
              )
            ) : (
              question && (
                <div key={questionIndex} className={leaving ? "q-leaving w-full" : "q-in w-full"}>
                  <AnimatedWords
                    text={question.prompt}
                    className="text-center text-[27px] font-bold leading-[1.25] tracking-[-0.02em] text-[#3b3226] dark:text-[#f5ede0]"
                    onDone={() => setSpeaking(false)}
                  />

                  {phase === "asking" && (
                    <p className="rise mt-4 text-center text-[14px] text-[#85735a] dark:text-[#9c8b72]">
                      Tap record and speak your answer.
                    </p>
                  )}
                  {phase === "listening" && (
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-[14px] font-medium text-[#8d6a2a] dark:text-[#e5be79]">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d9ab5e] opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c9a35d]" />
                      </span>
                      Listening… speak now.
                    </p>
                  )}

                  {phase === "processing" && <ProcessingState />}

                  {(phase === "review" || phase === "editing" || phase === "confirming") && (
                    <ReviewCard
                      draft={draft}
                      editing={phase === "editing"}
                      onDraftChange={setDraft}
                      severity={severity}
                      onSeverityChange={setSeverity}
                      locked={phase === "confirming"}
                      saved={phase === "confirming"}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* The waveform is useful while recording, but is hidden during
              processing and verification to keep those states uncluttered. */}
          {phase === "listening" && (
            <div className="mt-4 w-full">
              <Waveform listening />
            </div>
          )}
        </main>

        <footer className="mt-6 flex items-end justify-between">
          {completed ? (
            dangerSimulated ? (
              <div className="flex w-full flex-col gap-2.5">
                <a
                  href="tel:+18005550199"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8f3021] px-6 py-3.5 text-[15px] font-semibold text-[#fff7f2] transition-colors hover:bg-[#7a291c] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f3021] dark:bg-[#c65a45] dark:hover:bg-[#d46853]"
                >
                  <Phone size={18} strokeWidth={2} aria-hidden="true" />
                  Call your doctor
                </a>
                <a
                  href="tel:911"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#c65a45]/70 bg-[#f6e0d8]/70 px-6 py-3.5 text-[14.5px] font-semibold text-[#7d2b1c] transition-colors hover:bg-[#f2d3c8] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f3021] dark:border-[#e07a64]/60 dark:bg-[#421b15]/80 dark:text-[#fde8e1] dark:hover:bg-[#54221a]"
                >
                  <Siren size={18} strokeWidth={2} aria-hidden="true" />
                  Call 911 — emergency
                </a>
                <div className="mt-1 flex items-center justify-center gap-4 text-[13px]">
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="rounded-full px-3 py-2 font-medium text-[#7d2b1c] underline decoration-[#c65a45]/60 underline-offset-4 transition-colors hover:text-[#4a2318] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f3021] dark:text-[#f5bfb3] dark:hover:text-[#fde8e1]"
                  >
                    View report
                  </button>
                  <span aria-hidden="true" className="text-[#c65a45]/50">
                    /
                  </span>
                  <button
                    type="button"
                    onClick={goHome}
                    className="rounded-full px-3 py-2 font-medium text-[#6f6149] underline decoration-[#b98a3e]/50 underline-offset-4 transition-colors hover:text-[#3b3226] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#c7b69c] dark:hover:text-[#f5ede0]"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setDangerSimulated(true)}
                  className="mx-auto flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium text-[#8f6a3a] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#7d2b1c] hover:decoration-[#c65a45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#dfb870] dark:hover:text-[#f08b75]"
                >
                  <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
                  Demo: preview a danger sign alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowReport(true)}
                  className="home-card-solid flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[15px] font-medium text-[#4a3f30] dark:text-[#f5ede0] transition hover:border-[#c9a35d]/80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
                >
                  <FileText size={18} strokeWidth={1.8} />
                  View report
                </button>
                <button
                  type="button"
                  onClick={goHome}
                  className="w-full rounded-full bg-[#3b3226] px-6 py-4 text-[15px] font-medium text-[#fbe7b8] transition hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
                >
                  Back to home
                </button>
              </div>
            )
          ) : (
            <>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={phase === "editing" ? "Done editing" : "Edit answer"}
                  aria-pressed={phase === "editing"}
                  onClick={toggleEdit}
                  disabled={editDisabled}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    phase === "editing"
                      ? "border border-[#c9a35d] bg-[#fbe7b8] text-[#4a3f30] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12]"
                      : "home-icon-solid text-[#4a3f30] dark:text-[#f0e4ce] hover:border-[#c9a35d]/70"
                  }`}
                >
                  <PenLine size={18} strokeWidth={1.8} />
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  edit
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={
                    phase === "listening"
                      ? "Stop recording"
                      : phase === "review"
                        ? "Record again"
                        : phase === "processing"
                          ? "Processing answer"
                          : "Start recording"
                  }
                  aria-pressed={listening}
                  onClick={() => {
                    if (phase === "listening") stopListening();
                    else if (phase === "review") reRecord();
                    else startListening();
                  }}
                  disabled={recordDisabled}
                  className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] shadow-[0_18px_34px_-14px_rgba(60,45,25,0.65)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_18px_36px_-12px_rgba(229,190,121,0.42)]"
                >
                  {listening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#d9ab5e]/30" />
                  )}
                  {phase === "listening" ? (
                    <Pause size={28} strokeWidth={1.9} className="relative" fill="currentColor" />
                  ) : (
                    <Mic size={28} strokeWidth={1.9} className="relative" />
                  )}
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  {phase === "listening"
                    ? "pause"
                    : phase === "processing"
                      ? "working"
                      : phase === "review"
                        ? "redo"
                        : "record"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  aria-label={rightIsConfirm ? "Confirm answer" : "Skip question"}
                  onClick={rightIsConfirm ? confirmAnswer : skipQuestion}
                  disabled={phase === "confirming" || leaving}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-[#4a3f30] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    rightIsConfirm
                      ? "border border-[#c9a35d] bg-[#fbe7b8] hover:bg-[#f6dcaa] dark:border-[#e5be79] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
                      : "home-icon-solid dark:text-[#f0e4ce] hover:border-[#c9a35d]/70"
                  }`}
                >
                  {rightIsConfirm ? (
                    <Check size={21} strokeWidth={2.2} />
                  ) : (
                    <X size={20} strokeWidth={1.8} />
                  )}
                </button>
                <span className="text-[12px] font-medium tracking-wide text-[#6f6149] dark:text-[#b9a88e]">
                  {rightIsConfirm ? "confirm" : "skip"}
                </span>
              </div>
            </>
          )}
        </footer>
      </div>

      <CheckinReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        eyebrow="Today"
        title="Check-in report"
        entries={responses}
        dangerSigns={dangerSimulated ? [SIMULATED_DANGER_SIGN] : []}
      />
    </div>
  );
}
