import type { ReactNode } from "react";

type HeadingProps = {
  level?: 1 | 2 | 3;
  tone?: "default" | "primary";
  children: ReactNode;
};

const sizes = {
  1: "text-3xl",
  2: "text-2xl",
  3: "text-xl",
};

const tones = {
  default: "text-text",
  primary: "text-primary",
};

export function Heading({
  level = 1,
  tone = "default",
  children,
}: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag className={`${sizes[level]} font-semibold ${tones[tone]}`}>
      {children}
    </Tag>
  );
}
