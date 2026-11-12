"use client";

import { useEffect, useState } from "react";

export type ToastTone = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

type ToastListener = (toasts: ToastItem[]) => void;

let activeToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  const snapshot = [...activeToasts];
  listeners.forEach((listener) => listener(snapshot));
}

export function showToast(message: string, tone: ToastTone = "success", duration = 3000) {
  if (!message) return;
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

  const toast: ToastItem = { id, message, tone };
  // Keep up to 3 toasts visible at a time
  activeToasts = [...activeToasts.slice(-2), toast];
  notify();

  setTimeout(() => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notify();
  }, duration);
}

export function dismissToast(id: string) {
  activeToasts = activeToasts.filter((t) => t.id !== id);
  notify();
}

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>(activeToasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return items;
}
