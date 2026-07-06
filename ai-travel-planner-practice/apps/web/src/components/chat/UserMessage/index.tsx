"use client";

import { memo, type ReactElement } from "react";

import type { UserMessageProps } from "@copilotkit/react-ui";
import {
  cn,
  isHiddenCanvasChatMessage,
  stripCanvasChatOnlyPrefix,
} from "@/utils";
import { userMessageBubbleClasses, userMessageRowClasses } from "../styles";

const UserMessageComponent = ({ message }: UserMessageProps): ReactElement => {
  const content = message?.content;
  const text =
    typeof content === "string"
      ? content
      : (content
          ?.filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ") ?? "");

  if (!text || isHiddenCanvasChatMessage(text)) {
    return <></>;
  }

  const displayText: string = stripCanvasChatOnlyPrefix(text);

  return (
    <div className={userMessageRowClasses}>
      <div
        className={cn(
          userMessageBubbleClasses,
          "whitespace-pre-wrap wrap-break-word",
        )}
      >
        {displayText}
      </div>
    </div>
  );
};

export const UserMessage = memo(UserMessageComponent);
