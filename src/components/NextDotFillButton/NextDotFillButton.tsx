import "./styles.css";

import React from "react";

export interface NextDotFillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Pill button whose leading dot expands into a soft gold fill on hover.
 * The label stays in place; no arrow or secondary label is revealed.
 */
export function NextDotFillButton({
  label = "Begin your journey",
  className = "",
  ...props
}: NextDotFillButtonProps) {
  return (
    <button
      type="button"
      className={`next-dot-fill-button ${className}`.trim()}
      {...props}
    >
      <span className="next-dot-fill-button__fill" aria-hidden="true" />
      <span className="next-dot-fill-button__label">{label}</span>
    </button>
  );
}
