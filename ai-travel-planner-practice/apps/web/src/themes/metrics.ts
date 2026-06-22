import type { PaddingSize, Size } from "@/types";

export const paddingClasses: Record<PaddingSize, string> = {
  none: "",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-4 sm:p-6",
  xl: "p-6 sm:p-8",
  "2xl": "p-8 sm:p-10",
};

export const controlPaddingClasses: Record<Size, string> = {
  xs: "px-2 py-1",
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-5 py-3",
  xl: "px-6 py-3.5",
  "2xl": "px-8 py-4",
};

export const marginClasses: Record<Size, string> = {
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
  "2xl": "m-10",
};

export const gapClasses: Record<Size, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-10",
};

export const borderRadiusClasses: Record<Size, string> = {
  xs: "rounded-sm",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
};
