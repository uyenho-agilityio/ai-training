import type { ReactNode } from "react";

type TextProps = {
  as?: "p" | "span";
  size?: "sm" | "base" | "lg";
  weight?: "normal" | "semibold";
  tone?: "default" | "primary" | "muted";
  children: ReactNode;
};

const sizes = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const weights = {
  normal: "font-normal",
  semibold: "font-semibold",
};

const tones = {
  default: "text-text",
  primary: "text-primary",
  muted: "text-text/70",
};

export function Text({
  as: Tag = "p",
  size = "base",
  weight = "normal",
  tone = "default",
  children,
}: TextProps) {
  return (
    <Tag className={`${sizes[size]} ${weights[weight]} ${tones[tone]}`}>
      {children}
    </Tag>
  );
}
