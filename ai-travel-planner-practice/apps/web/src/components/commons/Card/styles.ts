import type { CardVariant } from "@/types";
import { paddingClasses } from "@/themes/metrics";

export const HOVER_CARD: string =
  "cursor-pointer transition-all hover:border-orange-300 hover:shadow-md";

export const cardBaseClasses: string = "flex flex-col";

export const cardVariantClasses: Record<CardVariant, string> = {
  primary: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  outline: "rounded-xl border border-dashed border-slate-200 bg-white",
  secondary: "rounded-xl border-2 border-orange-200 bg-white",
};

export { paddingClasses as cardPaddingClasses };
