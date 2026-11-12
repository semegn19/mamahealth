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
import { AppLogo } from "../components/AppLogo";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useProfile } from "../settings/profileStore";
import { useTranslation } from "../components/languageStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  authApi,
  ApiError,
  clearUserSessionData,
} from "../api";
import { clearNotifications } from "../notifications/notificationsData";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Brand() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b3226] p-1.5 shadow-sm dark:border dark:border-[#e5be79]/30 dark:bg-[#221c15]">
        <AppLogo className="h-full w-full" size={32} priority />
      </span>
      <span className="text-[19px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
        {t("common.appName")}
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
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] disabled:cursor-wait disabled:opacity-80 dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92] dark:focus-visible:outline-[#e5be79]"
    >
      {loading ? (
        <>
          <Loader2 size={17} strokeWidth={2.2} className="animate-spin" aria-hidden="true" />
          {t("auth.oneMoment")}
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
  const { t } = useTranslation();
  const { update, resetAll } = useProfile();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
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

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
  }, [initialMode]);

  useEffect(() => {
    const handlePop = () => {
      const isReg = typeof window !== "undefined" && window.location.pathname.includes("register");
      setMode(isReg ? "register" : "login");
      setErrors({});
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setSwap(true);
    setErrors({});
    setVerificationSent(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMode(next);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
      }
      setPassword("");
      setSwap(false);
    }, 160);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (mode === "register") {
      if (!firstName.trim()) next.firstName = t("auth.firstNameError");
      if (!lastName.trim()) next.lastName = t("auth.lastNameError");
    }
    if (!email.trim()) next.email = t("auth.emailError");
    else if (!EMAIL_RE.test(email.trim())) next.email = t("auth.emailInvalidError");
    if (!password) next.password = t("auth.passwordError");
    else if (mode === "register" && password.length < 8)
      next.password = t("auth.passwordLengthError");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const normalisedEmail = email.trim().toLowerCase();

    if (mode === "register") {
      try {
        clearUserSessionData();
        clearNotifications();
        resetAll();
        const signupRes = await authApi.signup(normalisedEmail, password);
        update({ name: `${firstName.trim()} ${lastName.trim()}`, email: normalisedEmail });
        
        // In production backend, signup requires email confirmation (HTTP 202 status=verification_required)
        if (signupRes.status === "verification_required") {
          setLoading(false);
          setVerificationSent(true);
          return;
        }

        // If email confirmation was disabled or session is immediately allowed:
        try {
          await authApi.login(normalisedEmail, password);
          setLoading(false);
          router.replace("/splash");
        } catch {
          setLoading(false);
          setVerificationSent(true);
        }
      } catch (err: unknown) {
        setLoading(false);
        const msg = err instanceof ApiError ? err.message : t("auth.accountExistsError");
        setErrors({ email: msg });
      }
      return;
    }

    // Login mode
    try {
      clearUserSessionData();
      clearNotifications();
      resetAll();
      await authApi.login(normalisedEmail, password);
      // Immediately navigate to splash screen to authenticate, hydrate user data, and route
      router.replace("/splash");
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof ApiError ? err.message : t("auth.invalidCredentialsError");
      setErrors({ password: msg });
    }
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
          <Link
            href="/"
            aria-label={t("common.back")}
            className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
          >
            <ChevronLeft size={19} strokeWidth={1.9} />
          </Link>
          <Brand />
          <LanguageSwitcher />
        </header>

        <div>
          {verificationSent ? (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf6e7] p-4 shadow-[0_12px_28px_-12px_rgba(201,163,93,0.5)] dark:border dark:border-[#e5be79]/30 dark:bg-[#2b2217]">
                <Mail size={36} className="text-[#8d6a2a] dark:text-[#e5be79]" strokeWidth={1.8} />
              </div>
              <h1 className="mt-6 text-[28px] font-light tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                {t("auth.verifyEmailTitle")}
              </h1>
              <p className="mt-3 max-w-[340px] text-[14.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {t("auth.verifyEmailSub").replace("{email}", email.trim())}
              </p>
              <div className="mt-8 w-full max-w-[320px]">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    switchMode("login");
                  }}
                  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:shadow-[0_16px_34px_-14px_rgba(229,190,121,0.45)] dark:hover:bg-[#f0cf92]"
                >
                  {t("auth.backToSignIn")}
                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-9">
                <h1
                  className={`text-[32px] font-light leading-[1.08] tracking-[-0.035em] text-[#3b3226] transition-all duration-300 dark:text-[#f5ede0] ${
                    swap ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
                  }`}
                >
                  {isRegister ? t("auth.createTitle") : t("auth.signInTitle")}
                </h1>
                <p
                  className={`mt-2.5 text-[14.5px] leading-relaxed text-[#6f6149] transition-opacity duration-300 dark:text-[#b9a88e] ${
                    swap ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {isRegister ? t("auth.createSub") : t("auth.signInSub")}
                </p>
              </div>

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
                    label={t("auth.firstName")}
                    value={firstName}
                    onChange={(value) => {
                      setFirstName(value);
                      setErrors((e) => ({ ...e, firstName: "" }));
                    }}
                    autoComplete="given-name"
                    placeholder={t("auth.firstNamePlaceholder")}
                    icon={<User size={16} strokeWidth={1.8} />}
                    error={errors.firstName}
                  />
                  <Field
                    id="last-name"
                    label={t("auth.lastName")}
                    value={lastName}
                    onChange={(value) => {
                      setLastName(value);
                      setErrors((e) => ({ ...e, lastName: "" }));
                    }}
                    autoComplete="family-name"
                    placeholder={t("auth.lastNamePlaceholder")}
                    icon={<User size={16} strokeWidth={1.8} />}
                    error={errors.lastName}
                  />
                </div>
              )}

              <Field
                id="auth-email"
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  setErrors((e) => ({ ...e, email: "" }));
                }}
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                icon={<Mail size={16} strokeWidth={1.8} />}
                error={errors.email}
              />

              <Field
                id="auth-password"
                label={t("auth.password")}
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setErrors((e) => ({ ...e, password: "" }));
                }}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={
                  isRegister
                    ? t("auth.passwordCreatePlaceholder")
                    : t("auth.passwordSignPlaceholder")
                }
                icon={<Lock size={16} strokeWidth={1.8} />}
                error={errors.password}
                reveal
              />
            </div>

            {isRegister && (
              <p className="mt-3 text-[12px] leading-relaxed text-[#85735a] dark:text-[#9c8b72]">
                {t("auth.prototypeNote")}
              </p>
            )}

            <div className="mt-5">
              <SubmitButton
                loading={loading}
                label={isRegister ? t("auth.createAccount") : t("auth.signIn")}
              />
            </div>

            <p className="mt-4 text-center text-[13px] text-[#6f6149] dark:text-[#b9a88e]">
              {isRegister ? t("auth.alreadyHave") : t("auth.newTo")}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? "login" : "register")}
                className="font-medium text-[#8d6a2a] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#4a3f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#e5be79] dark:hover:text-[#f5ede0] dark:focus-visible:outline-[#e5be79]"
              >
                {isRegister ? t("auth.signIn") : t("auth.createAccount")}
              </button>
            </p>
          </form>
          </>
          )}

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px] leading-relaxed text-[#9b8a6f] dark:text-[#9c8b72]">
            <Heart size={12} strokeWidth={2} aria-hidden="true" />
            {t("auth.tagline")}
          </p>
        </div>
      </div>
    </div>
  );
}
