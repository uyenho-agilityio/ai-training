"use client";

import React, {
  ElementType,
  HTMLAttributes,
  memo,
  ReactNode,
  type ReactElement,
} from "react";

import { cn } from "@/utils";
import { fontWeightClasses } from "@/themes/fonts";
import { Size, Color } from "@/types";
import { textSizeClasses, textColorClasses } from "./styles";

type TextProps = {
  size?: Size;
  color?: Color;
  isBold?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "color">;

const TextComponent = ({
  size = "md",
  color = "primary",
  isBold = false,
  as: Tag = "p",
  className,
  children,
  ...rest
}: TextProps): ReactElement => (
  <Tag
    className={cn(
      textSizeClasses[size],
      textColorClasses[color],
      isBold && fontWeightClasses.bold,
      className,
    )}
    {...rest}
  >
    {children}
  </Tag>
);

export const Text = memo(TextComponent);
