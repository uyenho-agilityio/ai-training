"use client";

import {
  CopilotChatAssistantMessage,
  type CopilotChatAssistantMessageProps,
} from "@copilotkit/react-core/v2";
import { cloneElement, isValidElement, type ReactElement } from "react";

import { useAssistantMessageToolbar } from "@/hooks";

const mergeButtonClassName = (
  button: ReactElement<{ className?: string }> | undefined,
  activeClassName?: string
) => {
  if (!button || !isValidElement(button) || !activeClassName) return button;

  const existing = button.props.className ?? "";
  return cloneElement(button, {
    className: existing ? `${existing} ${activeClassName}` : activeClassName,
  });
};

export const SystemMessage = ((props: CopilotChatAssistantMessageProps) => {
  const {
    onRegenerate,
    onThumbsUp,
    onThumbsDown,
    getThumbsUpClassName,
    getThumbsDownClassName,
  } = useAssistantMessageToolbar();

  return (
    <CopilotChatAssistantMessage
      {...props}
      onRegenerate={onRegenerate}
      onThumbsUp={onThumbsUp}
      onThumbsDown={onThumbsDown}
      className="pt-2"
    >
      {({
        message,
        markdownRenderer,
        toolCallsView,
        copyButton,
        thumbsUpButton,
        thumbsDownButton,
        regenerateButton,
        toolbarVisible,
      }) => {
        const hasText = Boolean(message.content?.trim());
        const hasTools = Boolean(message.toolCalls?.length);

        const styledThumbsUp = mergeButtonClassName(
          thumbsUpButton as ReactElement<{ className?: string }> | undefined,
          getThumbsUpClassName(message.id)
        );
        const styledThumbsDown = mergeButtonClassName(
          thumbsDownButton as ReactElement<{ className?: string }> | undefined,
          getThumbsDownClassName(message.id)
        );

        return (
          <div className="group flex max-w-[90%] flex-col items-start gap-1.5">
            <span className="inline-block rounded-full bg-green-200 px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-green-800 uppercase">
              Todo AI
            </span>
            <div className="rounded-2xl rounded-bl-sm border-2 border-green-300 bg-gradient-to-br from-emerald-50 to-green-100 px-4 py-3 text-sm leading-relaxed text-green-900 [&_li]:my-0.5 [&_li]:ml-4 [&_ol]:my-2 [&_ol]:list-decimal [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
              {hasText && markdownRenderer}
              {hasTools && (
                <div className="text-sm text-green-800">{toolCallsView}</div>
              )}
            </div>
            {toolbarVisible && hasText && (
              <div className="flex items-center gap-1 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:transition-colors">
                {regenerateButton}
                {copyButton}
                {styledThumbsUp}
                {styledThumbsDown}
              </div>
            )}
          </div>
        );
      }}
    </CopilotChatAssistantMessage>
  );
}) as typeof CopilotChatAssistantMessage;
