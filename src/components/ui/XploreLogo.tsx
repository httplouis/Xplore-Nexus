import Image from "next/image";

interface XploreLogoProps {
  /** px size for the logo image width */
  width?: number;
  /** variant: "default" = full-color on light | "dark-bg" = on dark backgrounds (adds invert+brightness) */
  variant?: "default" | "dark-bg";
  className?: string;
}

/**
 * Shared Xplore Nexus logo component.
 * Uses the official logo from /public/xplorenexus-logo.png
 */
export default function XploreLogo({
  width = 140,
  variant = "default",
  className = "",
}: XploreLogoProps) {
  const height = Math.round(width * 0.36); // aspect ratio ~2.77:1

  return (
    <Image
      src="/xplorenexus-logo.png"
      alt="Xplore Nexus"
      width={width}
      height={height}
      priority
      className={`object-contain ${variant === "dark-bg" ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
