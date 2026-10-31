"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../components/languageStore";
import { ModalDialog } from "../components/ModalDialog";

export function JourneyModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mama-health-open-journey-modal", onOpen);
    return () => window.removeEventListener("mama-health-open-journey-modal", onOpen);
  }, []);

  const trimesters = [
    { phase: t("landing.tri1"), detail: t("landing.tri1Sub") },
    { phase: t("landing.tri2"), detail: t("landing.tri2Sub") },
    { phase: t("landing.tri3"), detail: t("landing.tri3Sub") },
  ];

  return (
    <ModalDialog
      open={open}
      onClose={() => setOpen(false)}
      ariaLabelledBy="journey-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-[#f8f5ee]/95 p-7 shadow-[0_20px_60px_rgba(140,105,45,0.3)] backdrop-blur-2xl sm:p-9 dark:border-[#e5be79]/22 dark:bg-[#221c15]/96 dark:shadow-[0_24px_64px_rgba(0,0,0,0.85)]">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#4a3f30] transition hover:bg-black/10 dark:bg-white/10 dark:text-[#f0e4ce] dark:hover:bg-white/20"
          aria-label={t("common.close")}
        >
          ✕
        </button>

        <span className="inline-block rounded-full bg-[#faedd2] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[#966b24] dark:bg-[#e5be79]/18 dark:text-[#e5be79]">
          {t("landing.modalTag")}
        </span>

        <h3
          id="journey-modal-title"
          className="mt-3 text-2xl font-medium tracking-tight text-[#3b3226] sm:text-3xl dark:text-[#f5ede0]"
        >
          {t("landing.modalTitle")}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[#7e715d] dark:text-[#b9a88e]">
          {t("landing.modalDesc")}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {trimesters.map((item) => (
            <div
              key={item.phase}
              className="rounded-2xl border border-[#ebd8b7] bg-white/70 p-3 text-left dark:border-[#3d3123] dark:bg-[#19140f]/85"
            >
              <p className="text-xs font-semibold text-[#8b6528] dark:text-[#e5be79]">
                {item.phase}
              </p>
              <p className="mt-0.5 text-[11px] text-[#716453] dark:text-[#b9a88e]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="email"
            placeholder={t("landing.emailPlaceholder")}
            className="flex-1 rounded-full border border-[#ddcaa7] bg-white px-4 py-2.5 text-sm text-[#4a3f30] placeholder-[#b2a28d] outline-none focus:border-[#a88241] dark:border-[#4a3c2c] dark:bg-[#18130e] dark:text-[#f5ede0] dark:placeholder-[#7d6e58] dark:focus:border-[#e5be79]"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[#4a3f30] px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#342b20] dark:bg-[#e5be79] dark:text-[#231b12] dark:hover:bg-[#f0cf92]"
          >
            {t("landing.getEarlyAccess")}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
