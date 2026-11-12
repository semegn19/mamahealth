"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToasts, dismissToast, type ToastTone } from "./toastStore";

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "error") {
    return <AlertCircle size={17} className="shrink-0 text-[#c65a45] dark:text-[#f08b75]" aria-hidden="true" />;
  }
  if (tone === "info") {
    return <Info size={17} className="shrink-0 text-[#8d6a2a] dark:text-[#e5be79]" aria-hidden="true" />;
  }
  return <CheckCircle2 size={17} className="shrink-0 text-[#8d6a2a] dark:text-[#e5be79]" aria-hidden="true" />;
}

export function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-5 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className="pointer-events-auto home-glass-warm flex max-w-full items-center gap-2.5 rounded-full border border-[#e6d3ad] px-4 py-2.5 shadow-[0_14px_34px_-10px_rgba(112,78,28,0.38)] backdrop-blur-xl transition hover:scale-[1.02] active:scale-[0.98] motion-safe:animate-[rise_0.3s_cubic-bezier(0.16,1,0.3,1)_both] dark:border-[#e5be79]/30"
        >
          <ToneIcon tone={toast.tone} />
          <p className="min-w-0 truncate text-[13.5px] font-medium text-[#3b3226] dark:text-[#f5ede0]">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissToast(toast.id);
            }}
            aria-label="Dismiss toast"
            className="ml-1 -mr-1 flex h-6 w-6 items-center justify-center rounded-full text-[#85735a] transition hover:bg-black/5 hover:text-[#3b3226] dark:text-[#b9a88e] dark:hover:bg-white/10 dark:hover:text-[#f5ede0]"
          >
            <X size={13} strokeWidth={2.2} />
          </button>
        </div>
      ))}
    </div>
  );
}
