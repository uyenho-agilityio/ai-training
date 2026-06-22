import type { LoadingIndicatorLayout, Size } from "@/types";
import { gapClasses } from "@/themes/metrics";

export const loadingIndicatorSizeClasses: Record<Size, string> = {
  xs: "h-3 w-3 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-10 w-10 border-[3px]",
  "2xl": "h-12 w-12 border-4",
};

export const loadingIndicatorLayoutClasses: Record<
  LoadingIndicatorLayout,
  string
> = {
  inline: `inline-flex items-center ${gapClasses.sm}`,
  stacked: `flex flex-col items-center ${gapClasses.sm}`,
  centered: `flex flex-col items-center justify-center ${gapClasses.sm} text-center`,
};

export const loadingIndicatorSpinnerBaseClasses: string =
  "animate-spin rounded-full border-orange-200 border-t-orange-500";
