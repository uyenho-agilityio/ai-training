"use client";

import { forwardRef, memo, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";
import type { ButtonVariant, Size } from "@/types";
import {
  buttonBaseClasses,
  buttonVariantClasses,
  buttonSizeClasses,
} from "./styles";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

ButtonComponent.displayName = "ButtonComponent";
export const Button = memo(ButtonComponent);
