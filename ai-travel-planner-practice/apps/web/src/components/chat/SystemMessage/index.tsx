"use client";

import { memo, type ReactElement, type ReactNode } from "react";

import { Markdown, type AssistantMessageProps } from "@copilotkit/react-ui";

import { cn } from "@/utils";
import { systemMessageBubbleClasses, systemMessageRowClasses } from "../styles";
import { TypingIndicator } from "../TypingIndicator";

const SystemMessageComponent = ({
  message,
  isLoading,
  markdownTagRenderers,
}: AssistantMessageProps): ReactElement => {
  const content = message?.content ?? "";
  const uiPosition = message?.generativeUIPosition ?? "after";
  const generativeUi: ReactNode = message?.generativeUI?.();

  if (isLoading && !content) {
    return <TypingIndicator />;
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

      {isLoading && content && <TypingIndicator className="mt-2" />}
    </>
  );
};

export const SystemMessage = memo(SystemMessageComponent);
