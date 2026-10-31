"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}

/**
 * Modern accessible modal dialog using the native HTML `<dialog>` element.
 * Follows modern-web-guidance specifications:
 * - Native browser top-layer rendering
 * - Built-in focus trapping & containment
 * - Native Esc / back gesture cancellation
 * - Over-scroll containment (no document.body overflow locking needed)
 * - Declarative & click-outside light dismiss fallback
 * - Automatic focus restoration to the invoker element
 */
export function ModalDialog({
  open,
  onClose,
  ariaLabelledBy,
  ariaLabel,
  className = "",
  containerClassName = "",
  children,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      onCancel={(e) => {
        // Prevent default browser closing to let React state manage open/close
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Light dismiss fallback: when clicking the ::backdrop, event.target is the dialog itself
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
      className={`app-dialog fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:items-center sm:p-6 ${className}`}
    >
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-[440px] ${containerClassName}`}>
        {children}
      </div>
    </dialog>
  );
}
