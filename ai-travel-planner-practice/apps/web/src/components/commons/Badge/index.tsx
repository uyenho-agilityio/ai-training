"use client";

import { memo } from "react";
import type { ReactElement, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";
import type { BadgeVariant, Size } from "@/types";
import {
  badgeBaseClasses,
  badgeVariantClasses,
  badgeSizeClasses,
} from "./styles";

export type BadgeProps = {
  variant?: BadgeVariant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const BadgeComponent = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BadgeProps): ReactElement => (
  <span
    className={cn(
      badgeBaseClasses,
      badgeVariantClasses[variant],
      badgeSizeClasses[size],
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);

export const Badge = memo(BadgeComponent);
