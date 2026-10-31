"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { LeafMark } from "../components/LeafMark";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useProfile } from "../settings/profileStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Lightweight prototype accounts (stored locally, never sent anywhere) */
/* ------------------------------------------------------------------ */

type Account = { firstName: string; lastName: string; email: string; password: string };
const ACCOUNTS_KEY = "mama-health-accounts-v1";
const LEGACY_ACCOUNTS_KEY = "aurelia-accounts-v1";

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY) || localStorage.getItem(LEGACY_ACCOUNTS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Account[];
    }
  } catch {
    // Storage may be unavailable.
  }
  return [];
}

function saveAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // In-memory only.
  }
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8] dark:bg-[#e5be79] dark:text-[#231b12]">
        <LeafMark className="h-[25px] w-[25px]" />
      </span>
      <span className="text-[18px] font-medium tracking-tight text-[#4a3f30] dark:text-[#f5ede0]">
        Mama Health
      </span>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  icon,
  reveal,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  icon: React.ReactNode;
  reveal?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = reveal ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-[#4a3f30] dark:text-[#dfcfb6]"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a2937a] dark:text-[#9c8b72]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-12 w-full rounded-2xl border bg-white/85 py-3 pl-11 pr-11 text-[15px] text-[#3b3226] outline-none transition-colors placeholder:text-[#b3a48c] focus:border-[#a87a3d] focus:bg-white dark:bg-[#221c15]/85 dark:text-[#f5ede0] dark:placeholder:text-[#7d6e58] dark:focus:border-[#e5be79] dark:focus:bg-[#282018] ${
            error
              ? "border-[#9c3a29]/70 dark:border-[#e4725c]/70"
              : "border-[#d8c6a4] dark:border-[#4a3c2c]"
          }`}
        />
        {reveal && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#85735a] transition-colors hover:text-[#3b3226] dark:text-[#9c8b72] dark:hover:text-[#f5ede0]"
          >
            {visible ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[12px] leading-snug text-[#9c3a29] dark:text-[#f08b75]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] disabled:cursor-wait disabled:opacity-80 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92] dark:focus-visible:outline-[#e5be79]"
    >
      {loading ? (
        <>
          <Loader2 size={17} strokeWidth={2.2} className="animate-spin" aria-hidden="true" />
          One moment…
        </>
      ) : (
        <>
          {label}
          <ArrowRight
            size={17}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

type Mode = "login" | "register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AuthPage({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const { update } = useProfile();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [swap, setSwap] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    router.prefetch("/splash");
    router.prefetch("/onboarding");
    router.prefetch("/home");
  }, [router]);

  // Keep the screen in sync when the route changes (e.g. #register → #login),
  // since React reuses this component instead of remounting it.
  useEffect(() => {
    setMode(initialMode);
    setErrors({});
  }, [initialMode]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setSwap(true);
    setErrors({});
    timerRef.current = window.setTimeout(() => {
      // Change the real route so the URL, back button and app state stay in sync.
      router.push(next === "login" ? "/login" : "/register");
      setPassword("");
      setSwap(false);
    }, 180);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (mode === "register") {
      if (!firstName.trim()) next.firstName = "Please add your first name.";
      if (!lastName.trim()) next.lastName = "Please add your last name.";
    }
    if (!email.trim()) next.email = "Please add your email address.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "That email address doesn't look right.";
    if (!password) next.password = "Please enter a password.";
    else if (mode === "register" && password.length < 8)
      next.password = "Use at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);

    timerRef.current = window.setTimeout(() => {
      const accounts = loadAccounts();
      const normalisedEmail = email.trim().toLowerCase();

      if (mode === "register") {
        if (accounts.some((account) => account.email === normalisedEmail)) {
          setLoading(false);
          setErrors({ email: "An account with this email already exists. Try signing in." });
          return;
        }
        const account: Account = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalisedEmail,
          password,
        };
        saveAccounts([...accounts, account]);
        update({ name: `${account.firstName} ${account.lastName}`, email: normalisedEmail });
        // No confirmation pill here — the button keeps its loading state and we
        // move straight into onboarding.
        timerRef.current = window.setTimeout(() => {
          router.push("/onboarding");
        }, 600);
        return;
      }

      const account = accounts.find(
        (candidate) => candidate.email === normalisedEmail && candidate.password === password,
      );
      if (!account) {
        setLoading(false);
        setErrors({
          password: "We couldn't match that email and password. Try again or create an account.",
        });
        return;
      }
      update({ name: `${account.firstName} ${account.lastName}`, email: account.email });
      // Keep the button in its loading state; the splash screen takes over.
      timerRef.current = window.setTimeout(() => {
        router.push("/splash");
      }, 700);
    }, 750);
  };

  const isRegister = mode === "register";

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      {/* Soft ambient glow, consistent with the app */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-95 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[28%] h-[340px] w-[340px] rounded-full bg-[#f3d9a4] opacity-45 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-20 bottom-[-10%] h-[320px] w-[320px] rounded-full bg-[#f7dfb3] opacity-55 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
        <div className="absolute right-[12%] bottom-[6%] h-[200px] w-[200px] rounded-full bg-white opacity-70 blur-[80px] dark:bg-[#e5be79] dark:opacity-10" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
        <header className="relative z-30 flex items-center justify-between gap-3 pt-2">
          <a
            href=""
            aria-label="Back to the Mama Health home page"
            className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
          >
            <ChevronLeft size={19} strokeWidth={1.9} />
          </a>
          <Brand />
          <LanguageSwitcher />
        </header>

        <div>
          <div className="mt-9">
            <h1
              className={`text-[32px] font-light leading-[1.08] tracking-[-0.035em] text-[#3b3226] transition-all duration-300 dark:text-[#f5ede0] ${
                swap ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {isRegister ? "Create your account" : "Sign in to Mama Health"}
            </h1>
            <p
              className={`mt-2.5 text-[14.5px] leading-relaxed text-[#6f6149] transition-opacity duration-300 dark:text-[#b9a88e] ${
                swap ? "opacity-0" : "opacity-100"
              }`}
            >
              {isRegister
                ? "A calmer way to follow your pregnancy, week by week."
                : "Your check-ins, reports and care team in one quiet place."}
            </p>
          </div>

          {/* Form directly on the background */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`mt-7 transition-all duration-300 ${
              swap ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="space-y-4">
              {isRegister && (
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="first-name"
                    label="First name"
                    value={firstName}
                    onChange={(value) => {
                      setFirstName(value);
                      setErrors((e) => ({ ...e, firstName: "" }));
                    }}
                    autoComplete="given-name"
                    placeholder="Amara"
                    icon={<User size={16} strokeWidth={1.8} />}
                    error={errors.firstName}
                  />
                  <Field
                    id="last-name"
                    label="Last name"
                    value={lastName}
                    onChange={(value) => {
                      setLastName(value);
                      setErrors((e) => ({ ...e, lastName: "" }));
                    }}
                    autoComplete="family-name"
                    placeholder="Bennett"
                    icon={<User size={16} strokeWidth={1.8} />}
                    error={errors.lastName}
                  />
                </div>
              )}

              <Field
                id="auth-email"
                label="Email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setErrors((e) => ({ ...e, email: "" }));
                }}
                autoComplete="email"
                placeholder="you@example.com"
                icon={<Mail size={16} strokeWidth={1.8} />}
                error={errors.email}
              />

              <Field
                id="auth-password"
                label="Password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setErrors((e) => ({ ...e, password: "" }));
                }}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
                icon={<Lock size={16} strokeWidth={1.8} />}
                error={errors.password}
                reveal
              />
            </div>

            {isRegister && (
              <p className="mt-3 text-[12px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
                By continuing you agree to keep your account details private. This is a prototype —
                accounts stay on this device.
              </p>
            )}

            <div className="mt-5">
              <SubmitButton loading={loading} label={isRegister ? "Create account" : "Sign in"} />
            </div>

            <p className="mt-4 text-center text-[13px] text-[#6f6149] dark:text-[#b9a88e]">
              {isRegister ? "Already have an account? " : "New to Mama Health? "}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? "login" : "register")}
                className="font-medium text-[#8d6a2a] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#4a3f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#e5be79] dark:hover:text-[#f5ede0] dark:focus-visible:outline-[#e5be79]"
              >
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </p>

            <p className="mt-2.5 text-center">
              <Link
                href={isRegister ? "/onboarding" : "/splash"}
                prefetch={true}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[#9b8a6f] underline decoration-[#c9a35d]/40 underline-offset-4 transition-colors hover:text-[#4a3f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#9c8b72] dark:hover:text-[#f5ede0] dark:focus-visible:outline-[#e5be79]"
              >
                Skip for now
              </Link>
            </p>
          </form>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px] leading-relaxed text-[#9b8a6f] dark:text-[#9c8b72]">
            <Heart size={12} strokeWidth={2} aria-hidden="true" />
            Gentle, private care — always in your hands.
          </p>
        </div>
      </div>
    </div>
  );
}
