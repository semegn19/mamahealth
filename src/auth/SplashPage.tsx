"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "../components/AppLogo";
import { useTranslation } from "../components/languageStore";
import { getAccessToken, clearTokens, usersApi, checkinApi, reportsApi } from "../api";
import { updateProfile } from "../settings/profileStore";
import { backendCheckinToFrontendLog } from "../logs/checkinLogsData";
import { backendSummaryToArchiveItem } from "../report/reportCatalog";

/**
 * Single-state loading screen shown right after sign-in.
 * Logo at the center, app name beneath it, and gentle motion
 * (breathing logo, progress bar, rotating messages) while the app
 * authenticates and hydratess user data from the backend.
 * Routes immediately once backend authentication is complete.
 */
export function SplashPage() {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();

  const messages = [t("splash.msg1"), t("splash.msg2"), t("splash.msg3")];

  useEffect(() => {
    router.prefetch("/home");
    router.prefetch("/onboarding");

    let isMounted = true;
    let routed = false;

    const navigate = (dest: string) => {
      if (routed || !isMounted) return;
      routed = true;
      router.replace(dest);
    };

    const token = getAccessToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Hydrate all user data in parallel from backend while splash is displaying
    const mePromise = usersApi
      .getMe()
      .then((me) => {
        const live = me.current_pregnancy_status;
        const weeks =
          live?.gestational_age_weeks ??
          (typeof me.gestational_age_weeks === "number"
            ? me.gestational_age_weeks
            : undefined);
        const days =
          live?.gestational_age_days ??
          (typeof me.gestational_age_days === "number"
            ? me.gestational_age_days
            : 0);
        const edd = me.estimated_due_date || live?.estimated_due_date || undefined;
        const lnmp = me.effective_lnmp_date || me.lnmp_date || undefined;
        const trimester =
          live?.trimester ||
          me.trimester ||
          (weeks
            ? weeks < 14
              ? "first_trimester"
              : weeks < 28
                ? "second_trimester"
                : "third_trimester"
            : undefined);

        const mappedSupplements =
          Array.isArray(me.supplements) && me.supplements.length > 0
            ? me.supplements.map((s) => ({
                id: s.id,
                name: s.name,
                reminderTime: s.reminder_time ? s.reminder_time.slice(0, 5) : "08:00",
              }))
            : [];

        const cleanName =
          me.name && me.name.trim().toLowerCase() !== "amara bennett" ? me.name.trim() : undefined;
        const cleanEmail =
          me.email && me.email.trim().toLowerCase() !== "amara.bennett@example.com"
            ? me.email.trim()
            : undefined;

        const profileUpdate: any = {
          name: cleanName,
          email: cleanEmail,
          hospital: me.hospital || undefined,
          gestationalAgeWeeks: weeks,
          gestationalAgeDays: days,
          edd,
          lnmpDate: lnmp,
          trimester,
        };

        if (mappedSupplements.length > 0) profileUpdate.supplements = mappedSupplements;
        if (me.appointment?.appointment_date) {
          profileUpdate.nextAncDate = me.appointment.appointment_date;
          profileUpdate.appointment = {
            appointment_date: me.appointment.appointment_date,
            anc_contact_title: me.appointment.anc_contact_title,
            anc_contact_title_am: me.appointment.anc_contact_title_am,
            anc_contact_number: me.appointment.anc_contact_number,
          };
        }
        updateProfile(profileUpdate);
        return me;
      });

    // When backend finishes authentication & hydration, route immediately without simulated wait
    mePromise.then((me) => {
      if (me) {
        navigate(me.onboarding_completed ? "/home" : "/onboarding");
      } else {
        navigate("/login");
      }
    }).catch((err) => {
      console.error("Failed to authenticate session:", err);
      clearTokens();
      navigate("/login");
    });

    // Safety fallback timer: if network socket hangs indefinitely, don't leave user stranded
    const fallbackTimer = window.setTimeout(() => {
      navigate("/home");
    }, 4500);

    const rotate = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 1100);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      window.clearInterval(rotate);
    };
  }, [router, messages.length]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      {/* Soft ambient glow, consistent with the app */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-95 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[28%] h-[340px] w-[340px] rounded-full bg-[#f3d9a4] opacity-45 blur-[110px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-20 bottom-[-10%] h-[320px] w-[320px] rounded-full bg-[#f7dfb3] opacity-55 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
        <div className="absolute right-[12%] bottom-[6%] h-[200px] w-[200px] rounded-full bg-white opacity-70 blur-[80px] dark:bg-[#e5be79] dark:opacity-10" />
      </div>

      <div
        role="status"
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-1 flex-col items-center justify-center px-6 text-center"
      >
        {/* Logo with slow breathing pulse + expanding rings */}
        <div className="relative flex h-40 w-40 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#c9a35d]/40 [animation-duration:2.4s] dark:border-[#e5be79]/35" />
          <span
            className="absolute inset-0 animate-ping rounded-full border border-[#c9a35d]/30 [animation-duration:2.4s] dark:border-[#e5be79]/25"
            style={{ animationDelay: "1.2s" }}
          />
          <span className="splash-breathe flex h-28 w-28 items-center justify-center rounded-full bg-[#3b3226] p-3.5 shadow-[0_18px_40px_-16px_rgba(60,45,25,0.65)] dark:border dark:border-[#e5be79]/30 dark:bg-[#221c15] dark:shadow-[0_18px_44px_-14px_rgba(229,190,121,0.35)]">
            <AppLogo className="h-full w-full" size={100} priority />
          </span>
        </div>

        {/* App name */}
        <p className="mt-7 text-[38px] font-medium leading-none tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
          {t("common.appName")}
        </p>
        <p className="mt-2.5 text-[13.5px] text-[#6f6149] dark:text-[#b9a88e]">
          {t("common.tagline")}
        </p>

        {/* Progress bar */}
        <div
          aria-hidden="true"
          className="mt-9 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#e2d3b4] dark:bg-[#33291e]"
        >
          <div className="splash-progress h-full w-full rounded-full bg-gradient-to-r from-[#d9ab5e] to-[#a87a3d] dark:from-[#f0cf92] dark:to-[#c99642]" />
        </div>

        {/* Rotating message (visual only; screen readers get a static label) */}
        <p aria-hidden="true" className="mt-4 h-5 text-[13.5px] text-[#85735a] dark:text-[#9c8b72]">
          <span key={messageIndex} className="splash-msg inline-block">
            {messages[messageIndex]}
          </span>
        </p>
        <p className="sr-only">{t("splash.loadingSr")}</p>
      </div>
    </div>
  );
}
