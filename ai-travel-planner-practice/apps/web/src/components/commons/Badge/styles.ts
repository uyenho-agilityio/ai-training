import type { BadgeVariant, Size } from "@/types";
import { controlPaddingClasses } from "@/themes/metrics";
import { fontSizeClasses, fontWeightClasses } from "@/themes/fonts";

export const badgeBaseClasses: string = `inline-flex items-center justify-center rounded-full ${fontWeightClasses.bold}`;

export const badgeVariantClasses: Record<BadgeVariant, string> = {
  primary: "bg-orange-500 text-white",
  outline: "bg-white text-slate-600 ring-1 ring-slate-200",
};

export const badgeSizeClasses: Record<Size, string> = {
  xs: `px-1.5 py-0.5 text-[10px]`,
  sm: `${controlPaddingClasses.xs} text-[10px]`,
  md: `${controlPaddingClasses.sm} ${fontSizeClasses.xs}`,
  lg: `${controlPaddingClasses.md} ${fontSizeClasses.sm}`,
  xl: `${controlPaddingClasses.lg} ${fontSizeClasses.md}`,
  "2xl": `${controlPaddingClasses.xl} ${fontSizeClasses.lg}`,
};
