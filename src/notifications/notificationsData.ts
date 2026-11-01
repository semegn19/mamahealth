import { useSyncExternalStore } from "react";

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

import { MOCK_NOTIFICATIONS } from "../mock/notifications";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = MOCK_NOTIFICATIONS;

let cachedRawNotifications: string | null = null;
let cachedNotifications: NotificationItem[] = INITIAL_NOTIFICATIONS;

function loadStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw === cachedRawNotifications) {
      return cachedNotifications;
    }
    cachedRawNotifications = raw;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedNotifications = parsed.map((storedItem) => {
          const initial = INITIAL_NOTIFICATIONS.find((init) => init.id === storedItem.id);
          return {
            ...storedItem,
            title_am: initial?.title_am ?? storedItem.title_am,
            message_am: initial?.message_am ?? storedItem.message_am,
            time_am: initial?.time_am ?? storedItem.time_am,
          };
        });
        return cachedNotifications;
      }
    }
  } catch {
    // fallback
  }
  cachedNotifications = INITIAL_NOTIFICATIONS;
  return cachedNotifications;
}

function saveStoredNotifications(items: NotificationItem[]) {
  const raw = JSON.stringify(items);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // ignore
  }
  cachedRawNotifications = raw;
  cachedNotifications = items;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: items }));
}

function subscribeNotifications(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cachedRawNotifications = null;
    callback();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useNotifications() {
  const items = useSyncExternalStore(
    subscribeNotifications,
    loadStoredNotifications,
    () => INITIAL_NOTIFICATIONS,
  );

  const markAllRead = () => {
    const updated = items.map((n) => ({ ...n, read: true }));
    saveStoredNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
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
