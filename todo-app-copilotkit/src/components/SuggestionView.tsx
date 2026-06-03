"use client";

import { forwardRef } from "react";
import {
  CopilotChatSuggestionPill,
  CopilotChatSuggestionView,
  type CopilotChatSuggestionPillProps,
  type CopilotChatSuggestionViewProps,
} from "@copilotkit/react-core/v2";

const TodoSuggestionPill = forwardRef<
  HTMLButtonElement,
  CopilotChatSuggestionPillProps
>(({ className, ...props }, ref) => (
  <CopilotChatSuggestionPill
    ref={ref}
    {...props}
    className={[
      "border-gray-200! bg-gray-100! text-gray-600! hover:bg-gray-200! hover:text-gray-800! disabled:hover:bg-gray-100!",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  />
));
TodoSuggestionPill.displayName = "TodoSuggestionPill";

export const SuggestionView = forwardRef<
  HTMLDivElement,
  CopilotChatSuggestionViewProps
>((props, ref) => (
  <CopilotChatSuggestionView
    ref={ref}
    {...props}
    suggestion={TodoSuggestionPill}
  />
));
SuggestionView.displayName = "SuggestionView";
