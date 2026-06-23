"use client";

import { memo, type ReactElement } from "react";

import { ICON_DEFAULT_SIZE, type IconProps } from "./types";

const SendArrowIconComponent = ({
  className,
  size = ICON_DEFAULT_SIZE,
}: IconProps): ReactElement => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
  >
    <path
      d="M8 3.5V12.5M8 3.5L4.5 7M8 3.5L11.5 7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SendArrowIcon = memo(SendArrowIconComponent);
