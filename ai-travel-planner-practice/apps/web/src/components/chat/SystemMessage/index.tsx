"use client";

import { memo, type ReactElement, type ReactNode } from "react";

import { useCoAgent } from "@copilotkit/react-core";
import { Markdown, type AssistantMessageProps } from "@copilotkit/react-ui";

import { copilotAgent } from "@/constants";
import { cn, getAssistantMessageText, isVisibleMessage } from "@/utils";
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

  const content: string = getAssistantMessageText(
    message?.content ?? "",
  ).trim();
  const uiPosition = message?.generativeUIPosition ?? "after";
  const generativeUi: ReactNode = message?.generativeUI?.();
  const hasGenerativeUi: boolean = isVisibleMessage(generativeUi);
  const hasVisibleBody: boolean = Boolean(content || hasGenerativeUi);
  const isAgentWorkingCurrentTurn: boolean =
    Boolean(isCurrentMessage) && isAgentRunning;
  const isThinking: boolean =
    isLoading || isGenerating || isAgentWorkingCurrentTurn;

  if (!hasVisibleBody) {
    return isThinking ? <TypingIndicator /> : <></>;
  }

  return (
    <>
      {hasGenerativeUi && uiPosition === "before" && (
        <div className={cn(systemMessageRowClasses, "mb-2")}>
          {generativeUi}
        </div>
      )}

      {content ? (
        <div className={systemMessageRowClasses}>
          <div className={systemMessageBubbleClasses}>
            <Markdown content={content} components={markdownTagRenderers} />
          </div>
        </div>
      ) : null}

      {hasGenerativeUi && uiPosition === "after" && (
        <div className={cn(systemMessageRowClasses, "mt-2")}>
          {generativeUi}
        </div>
      )}

      {isThinking && !content ? <TypingIndicator className="mt-2" /> : null}
    </>
  );
};

export const SystemMessage = memo(SystemMessageComponent);
