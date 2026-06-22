import type { ButtonVariant, Size } from "@/types";
import { borderRadiusClasses, controlPaddingClasses } from "@/themes/metrics";
import { fontSizeClasses, fontWeightClasses } from "@/themes/fonts";

const HOVER_BTN: string =
  "cursor-pointer transition-colors hover:opacity-90 active:scale-[0.98]";

const cnVariant = (classes: string): string => {
  return `${HOVER_BTN} ${classes}`;
};

export const buttonBaseClasses: string = `inline-flex items-center justify-center ${fontWeightClasses.bold} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed`;

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: cnVariant(
    "rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-100 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40",
  ),
  secondary: cnVariant(
    "rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200",
  ),
  ghost: cnVariant(
    "rounded-lg text-orange-600 underline-offset-2 hover:underline",
  ),
  outline: cnVariant(
    "rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:ring-orange-200 disabled:cursor-wait disabled:opacity-70",
  ),
};

export const buttonSizeClasses: Record<Size, string> = {
  xs: `${controlPaddingClasses.xs} ${fontSizeClasses.xs}`,
  sm: `${borderRadiusClasses.sm} ${controlPaddingClasses.sm} ${fontSizeClasses.xs}`,
  md: `${controlPaddingClasses.md} ${fontSizeClasses.sm}`,
  lg: `w-full ${borderRadiusClasses.lg} py-3 ${fontSizeClasses.sm}`,
  xl: `${borderRadiusClasses.lg} ${controlPaddingClasses.xl} ${fontSizeClasses.md}`,
  "2xl": `w-full ${borderRadiusClasses.xl} ${controlPaddingClasses["2xl"]} ${fontSizeClasses.lg}`,
};
