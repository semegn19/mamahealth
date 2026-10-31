"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  Heart,
  Mic,
  Pill,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "../home/HomeDashboard";
import { useNotifications, type NotificationItem } from "./notificationsData";

export function NotificationsPage() {
  const { items, markAllRead } = useNotifications();
  const [tab, setTab] = useState<"unread" | "read">("unread");

  // Requirement: "when users go to this page the first time it assumes they read all the notifications
  // so after they leave it takes those notifications to the read tab"
  const pendingMarkAllReadOnLeave = useRef(true);

  useEffect(() => {
    return () => {
      if (pendingMarkAllReadOnLeave.current) {
        markAllRead();
      }
    };
  }, []);

  const unreadItems = items.filter((n) => !n.read);
  const readItems = items.filter((n) => n.read);
  const currentList = tab === "unread" ? unreadItems : readItems;

  const router = useRouter();

  const goBack = () => {
    router.push("/home");
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    const iconClass = "text-[#8d6a2a] dark:text-[#e5be79]";
    switch (category) {
      case "checkin":
        return <Mic size={18} strokeWidth={1.9} className={iconClass} />;
      case "appointment":
        return <CalendarDays size={18} strokeWidth={1.8} className={iconClass} />;
      case "supplement":
        return <Pill size={18} strokeWidth={1.8} className={iconClass} />;
      case "health":
        return <Heart size={18} strokeWidth={1.8} className={iconClass} />;
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30] dark:bg-[#15120e] dark:text-[#f0e4ce]">
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px] dark:bg-[#c99642] dark:opacity-12" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-30 blur-[105px] dark:bg-[#8d6224] dark:opacity-15" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px] dark:bg-[#6e4c1b] dark:opacity-16" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[720px] md:px-8">
        {/* Header bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Back to home"
              className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
            <div>
              <h1 className="text-[30px] font-light leading-none tracking-[-0.035em] text-[#3b3226] dark:text-[#f5ede0]">
                Notifications
              </h1>
            </div>
          </div>

          {unreadItems.length > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1.5 rounded-full border border-[#d8c6a4] bg-white/60 px-3.5 py-2 text-[12.5px] font-medium text-[#6f5a35] transition hover:bg-white active:scale-95 dark:border-[#4a3c2c] dark:bg-[#231c15]/85 dark:text-[#e5be79] dark:hover:bg-[#2d241b]"
            >
              <CheckCheck size={15} strokeWidth={1.9} />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">All read</span>
            </button>
          )}
        </header>

        {/* Sliding Segmented Pill: Unread / Read */}
        <div className="mt-7">
          <div className="relative flex rounded-full border border-[#d8c6a4]/80 bg-[#e7dcc7]/60 p-1 backdrop-blur-md dark:border-[#46392a] dark:bg-[#1e1812]/85">
            {/* Sliding highlight indicator */}
            <span
              className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-[#4a3f30] shadow-sm transition-all duration-300 ease-out dark:bg-[#e5be79] ${
                tab === "unread" ? "left-1" : "left-[calc(50%+4px)]"
              }`}
              aria-hidden="true"
            />

            <button
              type="button"
              role="tab"
              aria-selected={tab === "unread"}
              onClick={() => setTab("unread")}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
                tab === "unread"
                  ? "text-[#fffaf0] dark:text-[#231b12]"
                  : "text-[#6f6149] hover:text-[#3b3226] dark:text-[#b9a88e] dark:hover:text-[#f5ede0]"
              }`}
            >
              <span>Unread</span>
              {unreadItems.length > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors ${
                    tab === "unread"
                      ? "bg-[#c9a35d] text-[#2c2010] dark:bg-[#231b12] dark:text-[#e5be79]"
                      : "bg-[#d8c6a4] text-[#4a3f30] dark:bg-[#382d20] dark:text-[#dfcfb6]"
                  }`}
                >
                  {unreadItems.length}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tab === "read"}
              onClick={() => setTab("read")}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
                tab === "read"
                  ? "text-[#fffaf0] dark:text-[#231b12]"
                  : "text-[#6f6149] hover:text-[#3b3226] dark:text-[#b9a88e] dark:hover:text-[#f5ede0]"
              }`}
            >
              <span>Read</span>
              {readItems.length > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition-colors ${
                    tab === "read"
                      ? "bg-[#c9a35d] text-[#2c2010] dark:bg-[#231b12] dark:text-[#e5be79]"
                      : "bg-[#d8c6a4] text-[#4a3f30] dark:bg-[#382d20] dark:text-[#dfcfb6]"
                  }`}
                >
                  {readItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <section aria-label={`${tab} notifications`} className="mt-6 space-y-3">
          {currentList.length === 0 ? (
            <div className="home-glass rounded-[26px] p-8 text-center" data-dashboard-card>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fbe7b8] text-[#8d6a2a] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
                <Bell size={22} strokeWidth={1.8} />
              </span>
              <h2 className="mt-4 text-[18px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
                {tab === "unread" ? "You're all caught up" : "No read notifications"}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
                {tab === "unread"
                  ? "When new reminders or check-in prompts arrive, they will appear here."
                  : "Notifications marked as read will be archived here."}
              </p>
            </div>
          ) : (
            currentList.map((notif) => (
              <article
                key={notif.id}
                data-dashboard-card
                className={`relative overflow-hidden rounded-[24px] border p-4 sm:p-5 text-left transition-all backdrop-blur-xl ${
                  !notif.read
                    ? "border-[#c9a35d]/50 bg-gradient-to-br from-white/95 to-[#fbf5e8]/90 shadow-[0_12px_30px_-18px_rgba(112,78,28,0.45)] dark:border-[#e5be79]/40 dark:from-[#292118]/96 dark:to-[#1f1912]/94 dark:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.8)]"
                    : "border-white/60 bg-white/60 shadow-[0_4px_16px_-10px_rgba(112,78,28,0.2)] opacity-85 dark:border-[#3d3123]/80 dark:bg-[#1c1611]/75 dark:shadow-[0_8px_22px_-14px_rgba(0,0,0,0.7)]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fbe7b8]/70 shadow-sm dark:bg-[#e5be79]/16">
                    {getCategoryIcon(notif.category)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#85735a] dark:text-[#9c8b72]">
                        {notif.time}
                      </span>
                      {!notif.read && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-[#c9a35d] dark:bg-[#e5be79]"
                          title="Unread"
                        />
                      )}
                    </div>

                    <h2 className="mt-1 text-[15.5px] font-medium leading-snug tracking-tight text-[#3b3226] dark:text-[#f5ede0]">
                      {notif.title}
                    </h2>

                    <p className="mt-1 text-[13.5px] leading-relaxed text-[#6f6149] dark:text-[#c7b69c]">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <BottomNav current="home" />
    </div>
  );
}
