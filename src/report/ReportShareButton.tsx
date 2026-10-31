import { useState } from "react";
import { Share2 } from "lucide-react";
import { ShareReportDialog } from "./ShareReportDialog";

/** Opens the share-with-clinician dialog (QR code + link) for a report. */
export function ReportShareButton({
  appointment,
  reportId,
}: {
  appointment: string;
  reportId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share ANC report"
        aria-haspopup="dialog"
        className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] dark:text-[#f0e4ce] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a] dark:focus-visible:outline-[#e5be79]"
      >
        <Share2 size={19} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <ShareReportDialog
        open={open}
        onClose={() => setOpen(false)}
        reportId={reportId}
        appointment={appointment}
      />
    </>
  );
}
