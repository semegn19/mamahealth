"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserAvatar } from "./UserAvatar";
import { useTranslation } from "./languageStore";
import { useProfile } from "../settings/profileStore";
import { useNotifications } from "../notifications/notificationsData";

export function HomeTopBar({ now = new Date() }: { now?: Date }) {
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const { t, isAmharic } = useTranslation();
  const [deviceHour, setDeviceHour] = useState<number | null>(null);

  useEffect(() => {
    // Read the client device's local clock immediately after mount
    setDeviceHour(new Date().getHours());
  }, []);

  const getGreeting = () => {
    const h = deviceHour !== null ? deviceHour : now.getHours();
    if (h < 12) return t("greetings.morning");
    if (h < 18) return t("greetings.afternoon");
    return t("greetings.evening");
  };

  const displayName =
    profile.name?.trim() && profile.name.trim().toLowerCase() !== "amara bennett"
      ? profile.name.trim()
      : isAmharic
        ? "እናት"
        : "Mama";

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/settings"
        prefetch={true}
        aria-label={t("nav.settings")}
        className="flex items-center gap-3 rounded-full text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
      >
        <UserAvatar name={displayName} avatarIndex={profile.avatarIndex} size={48} />
        <div>
          <p suppressHydrationWarning className="text-[13px] text-[#85735a] dark:text-[#9c8b72]">{getGreeting()}</p>
          <p className="text-[17px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
            {displayName}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2.5">
        <LanguageSwitcher />
        <Link
          href="/notifications"
          prefetch={true}
          aria-label={`${t("nav.notifications")}${unreadCount > 0 ? `, ${unreadCount} ${t("notifications.unreadTab")}` : ""}`}
          className="home-icon-solid relative flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:text-[#f0e4ce] dark:focus-visible:outline-[#e5be79]"
        >
          <Bell size={19} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-[#8d6a2a] ring-2 ring-[#ece5d8] dark:bg-[#e5be79] dark:ring-[#17130f]"
              aria-hidden="true"
            />
          )}
        </Link>
      </div>
    </div>
  );
}
