"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useProfile } from "../settings/profileStore";
import { useNotifications } from "../notifications/notificationsData";

function greeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
}

export function HomeTopBar({ now = new Date() }: { now?: Date }) {
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/settings"
        prefetch={true}
        aria-label="Open settings"
        className="flex items-center gap-3 rounded-full text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
      >
        <Image
          src="/images/avatar.jpg"
          alt={profile.name}
          width={48}
          height={48}
          priority
          className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-[#e5be79]/35"
        />
        <div>
          <p className="text-[13px] text-[#85735a] dark:text-[#9c8b72]">{greeting(now)}</p>
          <p className="text-[17px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
            {profile.name}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2.5">
        <LanguageSwitcher />
        <Link
          href="/notifications"
          prefetch={true}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
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
