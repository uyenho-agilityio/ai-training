import type { Color } from "@/types";

export const palette = {
  white: "#fff",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
  },
  orange: {
    50: "#fff7ed",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
  },
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    900: "#78350f",
  },
  emerald: {
    100: "#d1fae5",
    700: "#047857",
  },
} as const;

export const colorClasses: Record<Color, string> = {
  muted: "text-slate-500",
  primary: "text-slate-800",
  accent: "text-orange-600",
  inverse: "text-white",
};
