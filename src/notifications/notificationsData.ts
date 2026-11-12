import { useEffect, useSyncExternalStore } from "react";
import { notificationsApi, type BackendNotificationItem } from "../api/notifications";
import { getAccessToken } from "../api/client";
import { showToast } from "../components/toastStore";

export type NotificationItem = {
  id: string;
  title: string;
  title_am?: string;
  message: string;
  message_am?: string;
  time: string;
  time_am?: string;
  category: "checkin" | "appointment" | "supplement" | "health";
  read: boolean;
  actionUrl?: string;
  timestamp?: number;
};

const CHANGE_EVENT = "mama-health-notifications-change";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

let cachedNotifications: NotificationItem[] = INITIAL_NOTIFICATIONS;

export function clearNotifications(): void {
  cachedNotifications = [];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: [] }));
  }
}

function formatRelativeTime(dateStr: string): { time: string; time_am: string } {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    const timeString = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const isPm = d.getHours() >= 12;
    const amPmAm = isPm ? "ከሰዓት" : "ጠዋት";
    const amHour = d.getHours() % 12 || 12;
    const amMinute = d.getMinutes().toString().padStart(2, "0");
    const amTimeString = `${amHour}:${amMinute} ${amPmAm}`;

    if (isToday) {
      return {
        time: `Today · ${timeString}`,
        time_am: `ዛሬ · ${amTimeString}`,
      };
    }
    if (isYesterday) {
      return {
        time: `Yesterday · ${timeString}`,
        time_am: `ትናንት · ${amTimeString}`,
      };
    }
    const daysDiff = Math.max(1, Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      time: `${daysDiff} days ago`,
      time_am: `ከ${daysDiff} ቀናት በፊት`,
    };
  } catch {
    return { time: "Recent", time_am: "በቅርቡ" };
  }
}

export function backendToFrontendNotification(item: BackendNotificationItem): NotificationItem {
  const rawDate = item.due_at || item.created_at;
  const timestamp = rawDate ? new Date(rawDate).getTime() : Date.now();
  const { time, time_am } = formatRelativeTime(rawDate || new Date().toISOString());
  const typeLower = (item.type || "").toLowerCase();

  let category: NotificationItem["category"] = "health";
  let title = "Health notification";
  let title_am = "የጤና ማሳሰቢያ";
  let message_am = item.message;

  if (typeLower.includes("supp")) {
    category = "supplement";
    title = "Iron & Supplement reminder";
    title_am = "የእንክብል ማስታወሻ";
    message_am = "ዕለታዊ የታዘዘልዎትን እንክብል ከአንድ ብርጭቆ ውሃ ጋር መውሰድዎን አይርሱ።";
  } else if (typeLower === "set_appointment") {
    category = "appointment";
    title = "Set your next ANC appointment";
    title_am = "ቀጣዩን የቅድመ ወሊድ ቀጠሮ ያስይዙ";
    message_am = "እባክዎ የሚቀጥለውን የቅድመ ወሊድ ክትትል (ANC) ቀጠሮዎን ያስይዙ።";
  } else if (typeLower.includes("appoint")) {
    category = "appointment";
    title = "Midwife appointment reminder";
    title_am = "የአዋላጅ ቀጠሮ ማስታወሻ";
    message_am = "የቅድመ ወሊድ ክሊኒክ ቀጠሮዎ እየደረሰ ነው። እባክዎ አስቀድመው ይዘጋጁ።";
  } else if (typeLower.includes("checkin")) {
    category = "checkin";
    title = "Daily check-in recorded";
    title_am = "ዕለታዊ ምዝገባ ተመዝግቧል";
    message_am = "የዛሬው የድምጽ ምዝገባዎ በተሳካ ሁኔታ ተቀምጧል።";
  } else if (typeLower.includes("summary") || typeLower.includes("report")) {
    category = "appointment";
    title = "Clinical summary compiled";
    title_am = "የክሊኒካል ሪፖርት ማጠቃለያ ተዘጋጅቷል";
    message_am = "የቅርብ ጊዜው የቅድመ ወሊድ ሪፖርት ማጠቃለያ ተዘጋጅቷል።";
  }

  return {
    id: item.id,
    title,
    title_am,
    message: item.message,
    message_am,
    time,
    time_am,
    category,
    read: item.dismissed,
    timestamp,
  };
}

function getStoredNotifications(): NotificationItem[] {
  return cachedNotifications;
}

function setInMemoryNotifications(items: NotificationItem[]) {
  cachedNotifications = items;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: items }));
  }
}

function subscribeNotifications(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    callback();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

function syncWithBackend(backendItems: BackendNotificationItem[]) {
  const convertedBackend = backendItems.map((b) => backendToFrontendNotification(b));
  setInMemoryNotifications(convertedBackend);
}

export function useNotifications() {
  const items = useSyncExternalStore(
    subscribeNotifications,
    getStoredNotifications,
    () => INITIAL_NOTIFICATIONS,
  );

  const fetchBackend = (showError = false) => {
    if (!getAccessToken()) return;
    notificationsApi
      .list()
      .then((backendItems) => {
        if (!backendItems) return;
        syncWithBackend(backendItems);
      })
      .catch((err) => {
        if (showError) {
          showToast(err instanceof Error ? err.message : "Failed to load notifications", "error");
        }
      });
  };

  useEffect(() => {
    fetchBackend();

    const handleFocus = () => {
      fetchBackend();
    };

    window.addEventListener("focus", handleFocus);
    const intervalId = window.setInterval(fetchBackend, 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, []);

  const markAllRead = () => {
    const prev = [...items];
    const unread = items.filter((n) => !n.read);
    const updated = items.map((n) => ({ ...n, read: true }));
    setInMemoryNotifications(updated);

    if (getAccessToken()) {
      Promise.all(
        unread
          .filter((item) => item.id.includes("-") && item.id.length > 20)
          .map((item) => notificationsApi.dismiss(item.id))
      ).catch((err) => {
        setInMemoryNotifications(prev);
        showToast(err instanceof Error ? err.message : "Failed to dismiss notifications", "error");
      });
    }
  };

  const markRead = (id: string) => {
    const prev = [...items];
    const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    setInMemoryNotifications(updated);

    if (getAccessToken() && id.includes("-") && id.length > 20) {
      notificationsApi.dismiss(id).catch((err) => {
        setInMemoryNotifications(prev);
        showToast(err instanceof Error ? err.message : "Failed to dismiss notification", "error");
      });
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    items,
    unreadCount,
    markAllRead,
    markRead,
    refresh: () => fetchBackend(true),
  };
}
