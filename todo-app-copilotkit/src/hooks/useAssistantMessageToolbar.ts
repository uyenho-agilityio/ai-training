"use client";

import {
  type CopilotChatAssistantMessageProps,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useCallback, useState } from "react";

type AssistantMessage = CopilotChatAssistantMessageProps["message"];
type ChatMessage = NonNullable<
  CopilotChatAssistantMessageProps["messages"]
>[number];
export type MessageFeedback = "up" | "down";

const THUMBS_UP_ACTIVE_CLASS =
  "bg-green-200 text-green-800 ring-1 ring-green-400";
const THUMBS_DOWN_ACTIVE_CLASS = "bg-red-100 text-red-700 ring-1 ring-red-300";

/**
 * Builds the message list to keep before re-running the agent (regenerate)
 * Drops the target assistant reply and everything after it, but keeps the
 * user prompt that led to it so the model can answer again
 */
const getHistoryCutoffForRegenerate = (
  messages: ChatMessage[],
  assistantMessageId: string
): ChatMessage[] | null => {
  const reloadMessageIndex = messages.findIndex(
    (msg) => msg.id === assistantMessageId
  );
  if (reloadMessageIndex === -1) return null;

  if (messages[reloadMessageIndex]?.role !== "assistant") return null;

  // Fallback for short threads: keep from the start.
  let historyCutoff: ChatMessage[] = [messages[0]!];

  if (messages.length > 2 && reloadMessageIndex !== 0) {
    // Keep history up through the last user message before this assistant reply.
    const lastUserMessageBeforeRegenerate = messages
      .slice(0, reloadMessageIndex)
      .toReversed()
      .find((msg) => msg.role === "user");

    if (!lastUserMessageBeforeRegenerate) {
      historyCutoff = [messages[0]!];
    } else {
      const indexOfLastUserMessage = messages.findIndex(
        (msg) => msg.id === lastUserMessageBeforeRegenerate.id
      );
      historyCutoff = messages.slice(0, indexOfLastUserMessage + 1);
    }
  } else if (messages.length > 2 && reloadMessageIndex === 0) {
    // First assistant message in a long thread: keep the opening pair.
    historyCutoff = [messages[0]!, messages[1]!];
  }

  return historyCutoff;
};

export const useAssistantMessageToolbar = () => {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [feedbackByMessageId, setFeedbackByMessageId] = useState<
    Record<string, MessageFeedback>
  >({});

  const getFeedback = useCallback(
    (messageId: string) => feedbackByMessageId[messageId],
    [feedbackByMessageId]
  );

  const getThumbsUpClassName = useCallback(
    (messageId: string) =>
      getFeedback(messageId) === "up" ? THUMBS_UP_ACTIVE_CLASS : undefined,
    [getFeedback]
  );

  const getThumbsDownClassName = useCallback(
    (messageId: string) =>
      getFeedback(messageId) === "down" ? THUMBS_DOWN_ACTIVE_CLASS : undefined,
    [getFeedback]
  );

  const onRegenerate = useCallback(
    async (message: AssistantMessage) => {
      if (!agent || agent.isRunning) return;

      const messages = agent.messages ?? [];
      if (!messages.length) return;

      const historyCutoff = getHistoryCutoffForRegenerate(messages, message.id);
      if (!historyCutoff) return;

      // Trim chat, then run agent again from the kept user prompt.
      agent.setMessages(historyCutoff);

      try {
        await copilotkit.runAgent({ agent });
      } catch (error) {
        console.error("Failed to regenerate assistant message", error);
      }
    },
    [agent, copilotkit]
  );

  const onThumbsUp = useCallback((message: AssistantMessage) => {
    setFeedbackByMessageId((prev) => {
      if (prev[message.id] === "up") {
        const next = { ...prev };
        delete next[message.id];
        return next;
      }
      return { ...prev, [message.id]: "up" };
    });
  }, []);

  const onThumbsDown = useCallback((message: AssistantMessage) => {
    setFeedbackByMessageId((prev) => {
      if (prev[message.id] === "down") {
        const next = { ...prev };
        delete next[message.id];
        return next;
      }
      return { ...prev, [message.id]: "down" };
    });
  }, []);

  return {
    onRegenerate,
    onThumbsUp,
    onThumbsDown,
    getThumbsUpClassName,
    getThumbsDownClassName,
  };
};
