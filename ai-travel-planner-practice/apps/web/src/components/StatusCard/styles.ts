import type { StatusCardVariant, ButtonVariant } from "@/types";

export const statusCardVariantClasses: Record<StatusCardVariant, string> = {
  success:
    "flex flex-col gap-3 border-emerald-200 bg-emerald-50 sm:flex-row sm:items-center sm:justify-between",
  error:
    "flex flex-col gap-3 border-red-200 bg-red-50 sm:flex-row sm:items-center sm:justify-between",
  warning:
    "flex flex-col gap-3 border-amber-200 bg-white sm:flex-row sm:items-center sm:justify-between",
};

export const statusCardMessageClasses: Record<StatusCardVariant, string> = {
  success: "font-semibold text-emerald-900",
  error: "font-semibold text-red-900",
  warning: "font-semibold text-amber-900",
};

export const statusCardActionVariant: Record<StatusCardVariant, ButtonVariant> =
  {
    success: "primary",
    error: "secondary",
    warning: "primary",
  };

export const statusCardActionClassName: Record<
  StatusCardVariant,
  string | null
> = {
  success: null,
  error: null,
  warning: "bg-amber-600 hover:bg-amber-700",
};
