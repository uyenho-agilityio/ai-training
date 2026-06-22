"use client";

import { memo, HTMLAttributes, useMemo, type ReactElement } from "react";

import { cn } from "@/utils";
import type { LoadingIndicatorLayout, Size } from "@/types";
import { Text } from "../Text";
import {
  loadingIndicatorLayoutClasses,
  loadingIndicatorSpinnerBaseClasses,
  loadingIndicatorSizeClasses,
} from "./styles";

type LoadingIndicatorProps = {
  label?: string;
  size?: Size;
  layout?: LoadingIndicatorLayout;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const LoadingIndicatorComponent = ({
  label,
  size = "md",
  layout = "inline",
  className,
  ...rest
}: LoadingIndicatorProps): ReactElement => {
  const containerClassName: string = useMemo(
    () => cn(loadingIndicatorLayoutClasses[layout], className),
    [layout, className],
  );

  const spinnerClassName: string = useMemo(
    () =>
      cn(loadingIndicatorSpinnerBaseClasses, loadingIndicatorSizeClasses[size]),
    [size],
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={containerClassName}
      {...rest}
    >
      <span className={spinnerClassName} aria-hidden="true" />

      {label && (
        <Text size="xs" color="muted" aria-hidden="true">
          {label}
        </Text>
      )}
    </div>
  );
};

export const LoadingIndicator = memo(LoadingIndicatorComponent);
