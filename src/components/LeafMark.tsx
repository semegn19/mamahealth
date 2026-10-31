"use client";

import { AppLogo } from "./AppLogo";

/**
 * Re-exports the official Mama Health brand mark (mother-and-child-gold.svg).
 * Preserves backwards compatibility for any imports referencing LeafMark.
 */
export function LeafMark({
  className = "h-[25px] w-[25px]",
}: {
  className?: string;
}) {
  return <AppLogo className={className} />;
}
