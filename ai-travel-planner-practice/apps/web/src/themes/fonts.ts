import type { FontWeight, LetterSpacing, Size } from "@/types";

/** Tailwind weights: normal = 500, semibold = 600, bold = 800. */
export const fontWeightClasses: Record<FontWeight, string> = {
  normal: "font-medium",
  semibold: "font-semibold",
  bold: "font-extrabold",
};

/** Font size scale for controls (Button, Badge). */
export const fontSizeClasses: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const textFontSizeClasses: Record<Size, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
};

export const headingFontSizeClasses: Record<Size, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-4xl",
};

export const letterSpacingClasses: Record<LetterSpacing, string> = {
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
};
