import type { ElementType, HTMLAttributes, ReactNode } from "react";

/** Visual style preset for typography hierarchy. */
export type TextVariant = "body" | "heading" | "label" | "caption";

/** Font size scale for Text. */
export type TextSize = "sm" | "md" | "lg" | "xl";

/** Semantic text color tokens. */
export type TextColor = "default" | "muted" | "primary" | "danger";

/** Props for the shared Text component. */
export type TextProps = {
  children: ReactNode;
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  as?: ElementType;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "color">;
