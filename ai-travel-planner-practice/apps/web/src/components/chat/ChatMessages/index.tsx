"use client";

import { memo, useMemo, type ReactElement } from "react";

import type { MessagesProps } from "@copilotkit/react-ui";

import { useDisplayOnlyChat, type DisplayOnlyChatMessage } from "@/hooks";
import { cn } from "@/utils";
import { userMessageBubbleClasses, userMessageRowClasses } from "../styles";

const renderDisplayOnlyBubble = (
  displayMessage: DisplayOnlyChatMessage,
): ReactElement => (
  <div key={displayMessage.id} className={userMessageRowClasses}>
    <div
      className={cn(
        userMessageBubbleClasses,
        "whitespace-pre-wrap wrap-break-word",
      )}
    >
      {displayMessage.text}
    </div>
  </div>
);

/** Agent thread messages interleaved with canvas-intercept user bubbles. */
const ChatMessagesComponent = ({
  messages,
  inProgress,
  children,
  RenderMessage,
  AssistantMessage,
  UserMessage,
  ImageRenderer,
  onRegenerate,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  messageFeedback,
  markdownTagRenderers,
  chatError,
  ErrorMessage,
}: MessagesProps): ReactElement => {
  const { messages: displayOnlyMessages } = useDisplayOnlyChat();

  const sortedDisplayOnlyMessages = useMemo(
    (): DisplayOnlyChatMessage[] =>
      [...displayOnlyMessages].sort(
        (left: DisplayOnlyChatMessage, right: DisplayOnlyChatMessage): number =>
          left.insertAfterMessageCount - right.insertAfterMessageCount,
      ),
    [displayOnlyMessages],
  );

  const lastMessageRole: string | undefined =
    messages[messages.length - 1]?.role;
  const showLoadingCursor: boolean =
    inProgress && (lastMessageRole === "user" || lastMessageRole === "tool");

  const interleavedMessages = useMemo((): ReactElement[] => {
    const elements: ReactElement[] = [];
    let displayPointer = 0;

    const maxInsertAfter: number = sortedDisplayOnlyMessages.reduce(
      (max: number, message: DisplayOnlyChatMessage): number =>
        Math.max(max, message.insertAfterMessageCount),
      0,
    );
    const loopEnd: number = Math.max(messages.length, maxInsertAfter);

    for (let index = 0; index <= loopEnd; index += 1) {
      while (displayPointer < sortedDisplayOnlyMessages.length) {
        const candidate: DisplayOnlyChatMessage | undefined =
          sortedDisplayOnlyMessages[displayPointer];

        if (candidate?.insertAfterMessageCount !== index) {
          break;
        }

        elements.push(renderDisplayOnlyBubble(candidate));
        displayPointer += 1;
      }

      if (index < messages.length) {
        const message = messages[index];

        if (message) {
          elements.push(
            <RenderMessage
              key={message.id}
              message={message}
              messages={messages}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={index === messages.length - 1}
              AssistantMessage={AssistantMessage}
              UserMessage={UserMessage}
              ImageRenderer={ImageRenderer}
              onRegenerate={onRegenerate}
              onCopy={onCopy}
              onThumbsUp={onThumbsUp}
              onThumbsDown={onThumbsDown}
              messageFeedback={messageFeedback}
              markdownTagRenderers={markdownTagRenderers}
            />,
          );
        }
      }
    }

    while (displayPointer < sortedDisplayOnlyMessages.length) {
      const orphan: DisplayOnlyChatMessage | undefined =
        sortedDisplayOnlyMessages[displayPointer];

      if (orphan) {
        elements.push(renderDisplayOnlyBubble(orphan));
      }

      displayPointer += 1;
    }

    return elements;
  }, [
    AssistantMessage,
    ImageRenderer,
    RenderMessage,
    UserMessage,
    inProgress,
    messageFeedback,
    markdownTagRenderers,
    messages,
    onCopy,
    onRegenerate,
    onThumbsDown,
    onThumbsUp,
    sortedDisplayOnlyMessages,
  ]);

  return (
    <div className="copilotKitMessages">
      <div className="copilotKitMessagesContainer">
        {interleavedMessages}

        {showLoadingCursor ? (
          <span data-testid="copilot-loading-cursor" className="inline-block" />
        ) : null}

        {chatError && ErrorMessage ? (
          <ErrorMessage error={chatError} isCurrentMessage />
        ) : null}
      </div>

      <footer className="copilotKitMessagesFooter">{children}</footer>
    </div>
  );
};

export const ChatMessages = memo(ChatMessagesComponent);
