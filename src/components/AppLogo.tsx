import Image from "next/image";

export interface AppLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

/**
 * Official Mama Health brand logo (Mother and child — warm gold).
 * Renders the vector SVG asset cleanly with dark/light mode compatibility.
 */
export function AppLogo({
  className = "h-8 w-8",
  size = 32,
  priority = false,
}: AppLogoProps) {
  return (
    <Image
      src="/images/mother-and-child-gold.svg"
      alt="Mama Health"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={`object-contain ${className}`}
    />
  );
}
