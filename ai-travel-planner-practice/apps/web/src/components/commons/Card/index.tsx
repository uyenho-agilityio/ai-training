"use client";

import React, {
  HTMLAttributes,
  memo,
  ReactNode,
  type ReactElement,
} from "react";

import { cn } from "@/utils";
import type { CardVariant, PaddingSize } from "@/types";
import {
  cardBaseClasses,
  cardVariantClasses,
  cardPaddingClasses,
} from "./styles";

type CardProps = {
  variant?: CardVariant;
  padding?: PaddingSize;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const CardComponent = ({
  children,
  variant = "primary",
  padding = "md",
  className,
  ...rest
}: CardProps): ReactElement => {
  return (
    <div
      className={cn(
        cardBaseClasses,
        cardVariantClasses[variant],
        cardPaddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const Card = memo(CardComponent);
