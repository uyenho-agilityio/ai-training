"use client";

import { memo, useMemo, type ReactElement } from "react";
import {
  textColorClasses,
  textDefaultElement,
  textSizeClasses,
  textVariantClasses,
} from "./text/constants";
import type { TextProps } from "./text/types";

/**
 * Builds the final Tailwind class string from variant, size, color, and overrides.
 */
const buildTextClassName = (
  variant: NonNullable<TextProps["variant"]>,
  size: NonNullable<TextProps["size"]>,
  color: NonNullable<TextProps["color"]>,
  className: string | undefined,
): string => {
  return [
    textVariantClasses[variant],
    textSizeClasses[size],
    textColorClasses[color],
    className,
  ]
    .filter(Boolean)
    .join(" ");
};

/** Typography primitive with variant, size, and color presets. */
const TextComponent = ({
  children,
  variant = "body",
  size = "md",
  color = "default",
  as,
  className,
  ...rest
}: TextProps): ReactElement => {
  const Component = as ?? textDefaultElement[variant];

  const resolvedClassName = useMemo(
    () => buildTextClassName(variant, size, color, className),
    [variant, size, color, className],
  );

  return (
    <Component className={resolvedClassName} {...rest}>
      {children}
    </Component>
  );
};

TextComponent.displayName = "Text";

export const Text = memo(TextComponent);
