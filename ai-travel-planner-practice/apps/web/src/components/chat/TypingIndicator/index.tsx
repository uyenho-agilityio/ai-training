"use client";

import { memo, type ReactElement } from "react";

import { cn } from "@/utils";
import {
  systemMessageRowClasses,
  typingIndicatorBubbleClasses,
} from "../styles";

type TypingIndicatorProps = {
  className?: string;
};

const TypingIndicatorComponent = ({
  className,
}: TypingIndicatorProps): ReactElement => (
  <div className={cn(systemMessageRowClasses, className)} aria-live="polite">
    <div
      className={typingIndicatorBubbleClasses}
      aria-label="Assistant is typing"
    >
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:0ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
    </div>
  </div>
);

export const TypingIndicator = memo(TypingIndicatorComponent);
