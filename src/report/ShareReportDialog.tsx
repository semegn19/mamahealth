import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Download, Share2, X } from "lucide-react";
import { LeafMark } from "../components/LeafMark";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "../components/languageStore";

type CopyState = "idle" | "copied" | "manual";

/**
 * Share an ANC report with a clinician.
 * Renders a scannable QR code plus the report link, with copy and download actions.
 */
export function ShareReportDialog({
  open,
  onClose,
  reportId,
  appointment,
}: {
  open: boolean;
  onClose: () => void;
  reportId: string;
  appointment: string;
}) {
  const { t, isAmharic } = useTranslation();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareFailed, setShareFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const url =
    typeof window === "undefined"
      ? `#report/${reportId}`
      : `${window.location.origin}${window.location.pathname}#report/${reportId}`;

  // Lock scroll while the sheet is open, move focus in, and restore it on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Keep keyboard focus inside the dialog until it is dismissed.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;

      const controls = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset transient feedback each time it opens.
  useEffect(() => {
    if (!open) return;
    setCopyState("idle");
    setShareFailed(false);
  }, [open]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  if (!open) return null;

  const copyLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      // Let the user copy manually if the clipboard is blocked.
      linkRef.current?.focus();
      linkRef.current?.select();
      setCopyState("manual");
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `Mama Health ANC report — ${appointment}`,
        text: `ANC report for your ${appointment}. Open the link or scan the QR code to review it.`,
        url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFailed(true);
    }
  };

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${data}`], {
      type: "image/svg+xml;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `mama-health-anc-report-${reportId}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  };

  // Mount above page containers so their blur/transform cannot clip the backdrop.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-report-title"
      className="fixed inset-0 z-[100] isolate flex items-end justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        aria-hidden="true"
        data-share-backdrop
        className="pointer-events-none absolute inset-0 bg-[#3b3226]/30 dark:bg-black/72 backdrop-blur-md"
      />
      <div
        ref={panelRef}
        data-share-panel
        className="report-sheet relative max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-[30px] border border-white/80 bg-[#fbf6ec]/[0.98] p-6 shadow-[0_18px_60px_-20px_rgba(85,55,18,0.5)] backdrop-blur-xl dark:border-[#e5be79]/22 dark:bg-[#221c15]/[0.98] dark:shadow-[0_24px_64px_-18px_rgba(0,0,0,0.88)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="share-report-title"
              className="text-[24px] font-medium tracking-tight text-[#3b3226] dark:text-[#f5ede0]"
            >
              {t("reports.shareDialogTitle")}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
              {t("reports.shareDialogSub", { appointment })}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* QR code — kept on a warm ivory quiet-zone mat so phone cameras scan reliably in any theme */}
        <div className="mt-6 rounded-[24px] border border-[#e7d7ba] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-[#e5be79]/25 dark:bg-[#19140f]/90 dark:shadow-none">
          <div
            ref={qrRef}
            className="relative mx-auto w-[216px] max-w-full overflow-hidden rounded-2xl bg-[#fffdf8] p-2.5 [&_svg]:h-auto [&_svg]:w-full"
          >
            <QRCodeSVG
              value={url}
              size={216}
              level="H"
              marginSize={1}
              bgColor="#fffdf8"
              fgColor="#3b3226"
              title={`QR code for the Mama Health ANC report — ${appointment}`}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffdf8] text-[#a87a3d] ring-4 ring-[#fffdf8]"
            >
              <LeafMark className="h-[25px] w-[25px]" />
            </span>
          </div>
          <p className="mt-3 text-center text-[12.5px] leading-relaxed text-[#6f6149] dark:text-[#b9a88e]">
            {t("reports.qrScanHint")}
          </p>
        </div>

        {/* Link */}
        <div className="mt-4">
          <label
            htmlFor="share-report-link"
            className="block text-[12px] font-medium uppercase tracking-[0.12em] text-[#8d6a2a] dark:text-[#dfb870]"
          >
            {t("reports.reportLink")}
          </label>
          <div className="mt-2">
            <input
              ref={linkRef}
              id="share-report-link"
              type="text"
              readOnly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
              className="min-h-11 w-full min-w-0 rounded-xl border border-[#d8c6a4] bg-white/90 px-3 py-2 text-[12.5px] text-[#4a3f30] outline-none focus:border-[#a87a3d] dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#dfcfb6] dark:focus:border-[#e5be79]"
            />
          </div>
          <p
            aria-live="polite"
            className="mt-2 min-h-5 text-[12.5px] text-[#6f5a35] dark:text-[#e5be79]"
          >
            {copyState === "copied"
              ? t("reports.linkCopied")
              : copyState === "manual"
                ? t("reports.selectHighlightedLink")
                : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={copyLink}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-6 py-3.5 text-[14.5px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
          >
            <Copy size={17} strokeWidth={1.9} aria-hidden="true" />
            {t("reports.copyLink")}
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={shareNative}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8c6a4] bg-white/60 px-4 py-3 text-[13.5px] font-medium text-[#6f5a35] transition hover:bg-white/85 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:border-[#4a3c2c] dark:bg-[#1b1510] dark:text-[#dfcfb6] dark:hover:bg-[#271f17]"
            >
              <Share2 size={16} strokeWidth={1.8} aria-hidden="true" />
              {t("reports.shareBtn")}
            </button>
            <button
              type="button"
              onClick={downloadQr}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8c6a4] bg-white/60 px-4 py-3 text-[13.5px] font-medium text-[#6f5a35] transition hover:bg-white/85 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:border-[#4a3c2c] dark:bg-[#1b1510] dark:text-[#dfcfb6] dark:hover:bg-[#271f17]"
            >
              <Download size={16} strokeWidth={1.8} aria-hidden="true" />
              {t("reports.saveQr")}
            </button>
          </div>
          {shareFailed && (
            <p role="alert" className="text-center text-[12.5px] text-[#9c3a29] dark:text-[#f08b75]">
              {t("reports.shareNotSupported")}
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-[#8d7a5c] dark:text-[#9c8b72]">
          {t("reports.shareWarning")}
        </p>
      </div>
    </div>,
    document.body,
  );
}
