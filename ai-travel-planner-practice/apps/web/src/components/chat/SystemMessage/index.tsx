"use client";

import { memo, type ReactElement, type ReactNode } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { Markdown, type AssistantMessageProps } from "@copilotkit/react-ui";

import { copilotAgent } from "@/constants";
import { cn, getAssistantMessageText } from "@/utils";
import { systemMessageBubbleClasses, systemMessageRowClasses } from "../styles";
import { TypingIndicator } from "../TypingIndicator";

const SystemMessageComponent = ({
  message,
  isLoading,
  isGenerating,
  isCurrentMessage,
  markdownTagRenderers,
}: AssistantMessageProps): ReactElement => {
  const { running: isAgentRunning } = useCoAgent({ name: copilotAgent });

  const content: string = getAssistantMessageText(message?.content ?? "");
  const uiPosition = message?.generativeUIPosition ?? "after";
  const generativeUi: ReactNode = message?.generativeUI?.();
  const hasVisibleBody: boolean = Boolean(content || generativeUi);
  const isAgentWorkingCurrentTurn: boolean =
    Boolean(isCurrentMessage) && isAgentRunning;
  const isThinking: boolean =
    isLoading || isGenerating || isAgentWorkingCurrentTurn;

  // Tool-only / empty turns: show typing while active, otherwise render nothing.
  if (!hasVisibleBody) {
    return isThinking ? <TypingIndicator /> : <></>;
  }

  return (
    <>
      {generativeUi && uiPosition === "before" && (
        <div className={cn(systemMessageRowClasses, "mb-2")}>
          {generativeUi}
        </div>
      )}

      {content && (
        <div className={systemMessageRowClasses}>
          <div className={systemMessageBubbleClasses}>
            <Markdown content={content} components={markdownTagRenderers} />
          </div>
        </div>
      )}

      {generativeUi && uiPosition === "after" && (
        <div className={cn(systemMessageRowClasses, "mt-2")}>
          {generativeUi}
        </div>
      )}

      {isThinking && <TypingIndicator className="mt-2" />}
    </>
  );
};

export const SystemMessage = memo(SystemMessageComponent);
