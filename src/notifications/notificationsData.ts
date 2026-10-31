import { useEffect, useState } from "react";

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
};

const STORAGE_KEY = "mama-health-notifications-v1";
const LEGACY_STORAGE_KEY = "aurelia-notifications-v1";
const CHANGE_EVENT = "mama-health-notifications-change";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Morning check-in ready",
    title_am: "የጥዋት ምዝገባ ዝግጁ ነው",
    message: "Take 60 seconds to speak how you're feeling today. Your midwife can review any updates.",
    message_am: "ዛሬ የሚሰማዎትን ለመናገር 60 ሰከንድ ይውሰዱ። አዋላጅዎ ማንኛውንም አዲስ መረጃ መገምገም ይችላሉ።",
    time: "Today · 8:00 AM",
    time_am: "ዛሬ · 8:00 ጠዋት",
    category: "checkin",
    read: false,
    actionUrl: "#voice",
  },
  {
    id: "notif-2",
    title: "Midwife appointment reminder",
    title_am: "የአዋላጅ ቀጠሮ ማስታወሻ",
    message: "Upcoming 3rd ANC appointment scheduled with Dr. Naomi Adeyemi.",
    message_am: "ከዶ/ር ናዖሚ አደየሚ ጋር የሚደረግ 3ኛው የቅድመ ወሊድ ቀጠሮ ደርሷል።",
    time: "Yesterday · 4:30 PM",
    time_am: "ትናንት · 4:30 ከሰዓት",
    category: "appointment",
    read: false,
    actionUrl: "#calendar",
  },
  {
    id: "notif-3",
    title: "Iron supplement reminder",
    title_am: "የብረት እንክብል ማስታወሻ",
    message: "Don't forget your daily iron supplement with a glass of water or citrus juice.",
    message_am: "ዕለታዊ የብረት እንክብልዎን ከአንድ ብርጭቆ ውሃ ወይም ፍራፍሬ ጭማቂ ጋር መውሰድዎን አይርሱ።",
    time: "Yesterday · 8:00 AM",
    time_am: "ትናንት · 8:00 ጠዋት",
    category: "supplement",
    read: false,
    actionUrl: "#settings",
  },
  {
    id: "notif-4",
    title: "Week 24 milestone: baby is hearing sounds",
    title_am: "ሳምንት 24፡ ህፃኑ ድምጽ መስማት ጀምሯል",
    message: "Your little one's inner ear is fully formed now and can hear the cadence of your voice.",
    message_am: "የልጅዎ የውስጥ ጆሮ አሁን ሙሉ በሙሉ አድጓል፣ የእርስዎን ድምጽም መለየት ይችላል።",
    time: "2 days ago",
    time_am: "ከ2 ቀናት በፊት",
    category: "health",
    read: true,
  },
  {
    id: "notif-5",
    title: "Previous check-in summary compiled",
    title_am: "ያለፈው ምዝገባ ማጠቃለያ ተዘጋጅቷል",
    message: "Your monthly check-in entries were compiled into the latest ANC report.",
    message_am: "የወሩ ምዝገባዎች ወደ አዲሱ የቅድመ ወሊድ ሪፖርት ተጠቃለዋል።",
    time: "3 days ago",
    time_am: "ከ3 ቀናት በፊት",
    category: "appointment",
    read: true,
    actionUrl: "#reports",
  },
];

function loadStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with current translations
        return parsed.map((storedItem) => {
          const initial = INITIAL_NOTIFICATIONS.find((init) => init.id === storedItem.id);
          return {
            ...storedItem,
            title_am: initial?.title_am ?? storedItem.title_am,
            message_am: initial?.message_am ?? storedItem.message_am,
            time_am: initial?.time_am ?? storedItem.time_am,
          };
        });
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

function saveStoredNotifications(items: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: items }));
}

export function useNotifications() {
  // Deterministic first render for SSR; saved read/unread state arrives on mount.
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    setItems(loadStoredNotifications());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NotificationItem[]>).detail;
      if (detail) setItems(detail);
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const markAllRead = () => {
    const updated = items.map((n) => ({ ...n, read: true }));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    items,
    unreadCount,
    markAllRead,
    markRead,
  };
}
