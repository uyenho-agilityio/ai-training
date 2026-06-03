import type { TextColor, TextSize, TextVariant } from "./types";

/** Tailwind classes mapped to each text variant. */
export const textVariantClasses: Record<TextVariant, string> = {
  body: "font-normal leading-relaxed",
  heading: "font-semibold tracking-tight",
  label: "font-medium uppercase tracking-wide",
  caption: "font-normal italic",
};

/** Tailwind classes mapped to each text size. */
export const textSizeClasses: Record<TextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

/** Tailwind classes mapped to each text color. */
export const textColorClasses: Record<TextColor, string> = {
  default: "text-foreground",
  muted: "text-neutral-500 dark:text-neutral-400",
  primary: "text-blue-600 dark:text-blue-400",
  danger: "text-red-600 dark:text-red-400",
};

/** Default element tag per variant when `as` is omitted. */
export const textDefaultElement: Record<TextVariant, "p" | "h2" | "span"> = {
  body: "p",
  heading: "h2",
  label: "span",
  caption: "span",
};
