"use client";

import {
  ChangeEvent,
  memo,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import { useAgent } from "@copilotkit/react-core/v2";
import type { InputProps } from "@copilotkit/react-ui";
import { useChatContext } from "@copilotkit/react-ui";

import { copilotAgent, PLANNING_IN_PROGRESS_MESSAGE } from "@/constants";
import {
  isGenerateItineraryChatIntent,
  isRetryChatMessage,
  tryConsumeGenerateItineraryFromChat,
  tryHandleGenerateConfirmChatIntent,
  buildBookingPrerequisitesUserPrompt,
  buildTopicDeclinePrompt,
  clearBookingPrerequisitesPending,
  getBookingSearchMissingPrerequisites,
  getFollowUpBookingMissingPrerequisites,
  getAuthoritativeTripContext,
  isBookingPrerequisitesPending,
  isTravelPlannerRelatedMessage,
  markBookingPrerequisitesPending,
  isMorePlacesRequest,
  buildMorePlacesExcludeMessage,
} from "@/utils";
import { useRunAgentMessage } from "@/hooks";
import { SendArrowIcon } from "@/icons";
import { Button, Text } from "../../commons";
import { TypingIndicator } from "../TypingIndicator";
import { chatInputContainerClasses, chatInputTextareaClasses } from "../styles";

const ChatInputComponent = ({
  inProgress,
  hideStopButton = false,
  chatReady = true,
  onSend,
  onStop,
}: InputProps): ReactElement => {
  const { labels } = useChatContext();
  const { agent } = useAgent({ agentId: copilotAgent });
  const { appendCanvasChatOnlyUserMessage, stopAgentMessage } =
    useRunAgentMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const isAgentRunning: boolean = agent.isRunning;
  const showAgentWorking: boolean = isAgentRunning && !inProgress;
  const canStop: boolean = !hideStopButton && (inProgress || isAgentRunning);

  const handleStop = useCallback((): void => {
    onStop?.();
    stopAgentMessage();
  }, [onStop, stopAgentMessage]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (canStop) {
      handleStop();
      return;
    }

    if (!chatReady || !text.trim()) {
      return;
    }

    const trimmed: string = text.trim();

    const appendBookingPrerequisitesPrompt = (
      userMessage: string,
      missing: ReturnType<typeof getBookingSearchMissingPrerequisites>,
    ): void => {
      const tripContext = getAuthoritativeTripContext();

      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
      });

      agent.addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: buildBookingPrerequisitesUserPrompt(
          missing,
          tripContext.destination,
        ),
      });

      setText("");
      textareaRef.current?.focus();
    };

    if (tryHandleGenerateConfirmChatIntent(trimmed)) {
      appendCanvasChatOnlyUserMessage(trimmed);
      setText("");
      textareaRef.current?.focus();
      return;
    }

    const isMakeItRealOrRetry: boolean =
      isGenerateItineraryChatIntent(trimmed) || isRetryChatMessage(trimmed);

    if (isMakeItRealOrRetry) {
      appendCanvasChatOnlyUserMessage(trimmed);

      if (tryConsumeGenerateItineraryFromChat(trimmed)) {
        setText("");
        textareaRef.current?.focus();
        return;
      }

      onSend(trimmed);
      setText("");
      textareaRef.current?.focus();
      return;
    }

    if (isBookingPrerequisitesPending()) {
      const followUpMissing = getFollowUpBookingMissingPrerequisites(
        trimmed,
        agent.messages,
      );

      if (followUpMissing.length > 0) {
        appendBookingPrerequisitesPrompt(trimmed, followUpMissing);
        return;
      }

      clearBookingPrerequisitesPending();

      onSend(trimmed);
      setText("");
      textareaRef.current?.focus();
      return;
    }

    const missingPrerequisites = getBookingSearchMissingPrerequisites(
      trimmed,
      agent.messages,
    );

    if (missingPrerequisites.length > 0) {
      markBookingPrerequisitesPending(missingPrerequisites);
      appendBookingPrerequisitesPrompt(trimmed, missingPrerequisites);
      return;
    }

    if (!isTravelPlannerRelatedMessage(trimmed, agent.messages)) {
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      });

      agent.addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: buildTopicDeclinePrompt(),
      });

      setText("");
      textareaRef.current?.focus();
      return;
    }

    const tripContext = getAuthoritativeTripContext();
    const existingPlaceTitles: string[] = tripContext.places
      .map((place) => place.title.trim())
      .filter((title: string) => title.length > 0);

    if (isMorePlacesRequest(trimmed) && existingPlaceTitles.length > 0) {
      appendCanvasChatOnlyUserMessage(trimmed);
      onSend(buildMorePlacesExcludeMessage(trimmed, existingPlaceTitles));
      setText("");
      textareaRef.current?.focus();
      return;
    }

    onSend(trimmed);
    setText("");
    textareaRef.current?.focus();
  }, [
    agent,
    agent.messages,
    appendCanvasChatOnlyUserMessage,
    canStop,
    chatReady,
    handleStop,
    onSend,
    text,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey || isComposing) {
        return;
      }

      event.preventDefault();
      handleSend();
    },
    [handleSend, isComposing],
  );

  return (
    <div className="px-4 pb-3 pt-2">
      {showAgentWorking && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <TypingIndicator />
            <Text
              size="xs"
              color="muted"
              className="mt-1 px-1 text-xs font-medium text-amber-900"
            >
              {PLANNING_IN_PROGRESS_MESSAGE}
            </Text>
          </div>

          {!hideStopButton && (
            <Button
              variant="outline"
              size="xs"
              className="shrink-0 border-orange-200 text-orange-700 hover:bg-orange-50"
              aria-label="Stop agent"
              onClick={handleStop}
            >
              Stop
            </Button>
          )}
        </div>
      )}

      <div className={chatInputContainerClasses}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={labels.placeholder}
          value={text}
          disabled={!chatReady}
          className={chatInputTextareaClasses}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <Button
          variant="soft"
          size="xs"
          className="h-8 w-8 shrink-0 self-center p-0"
          aria-label={canStop ? "Stop" : "Send message"}
          disabled={canStop ? false : !chatReady || !text.trim()}
          onClick={handleSend}
        >
          {canStop ? (
            <span className="block h-2.5 w-2.5 rounded-sm bg-slate-700" />
          ) : (
            <SendArrowIcon className="text-orange-600" />
          )}
        </Button>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
