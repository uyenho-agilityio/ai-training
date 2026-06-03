import { memo } from "react";

import type { IconProps } from "./types";

export const PlusIcon = memo(({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden
    className={className ?? "size-5"}
    {...props}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
));

PlusIcon.displayName = "PlusIcon";
