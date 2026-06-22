"use client";

import { memo, HTMLAttributes, ReactNode, type ReactElement } from "react";

import { cn } from "@/utils";
import { colorClasses } from "@/themes/colors";
import { fontWeightClasses, headingFontSizeClasses } from "@/themes";
import { headingDefaultSize } from "./styles";
import type { Color, HeadingVariant, Size } from "@/types";

type HeadingProps = {
  variant?: HeadingVariant;
  size?: Size;
  color?: Color;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLHeadingElement>, "color">;

const HeadingComponent = ({
  variant = "h2",
  size,
  color = "primary",
  className,
  children,
  ...rest
}: HeadingProps): ReactElement => {
  const Component = variant;
  const resolvedSize: Size = size ?? headingDefaultSize[variant];

  return (
    <Component
      className={cn(
        fontWeightClasses.bold,
        headingFontSizeClasses[resolvedSize],
        colorClasses[color],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const Heading = memo(HeadingComponent);
