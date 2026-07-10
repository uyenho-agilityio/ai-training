import {
  TOPIC_DECLINE_MESSAGE,
  TRAVEL_TOPIC_PATTERN,
  normalizeTopicText,
} from "@/constants";
import type { AssistantMessageContent, TextMessagePart } from "@/types";

import {
  isBookingSearchChatIntent,
  messageHasDepartureOrigin,
  messageHasTravelDates,
} from "./booking";
import {
  getAssistantMessageText,
  isGenerateConfirmChatIntent,
  isGenerateItineraryChatIntent,
  isRetryChatMessage,
} from "./travel";

export { normalizeTopicText };

type ChatMessageLike = {
  role?: string;
  content?: unknown;
};

/** Language-neutral arithmetic — decline on the client without calling the agent. */
const CLEARLY_OFF_TOPIC_PATTERN: RegExp =
  /(?:what(?:'s|'s| is)\s+\d+\s*[+*/×÷-]\s*\d+|^\d+\s*[+*/×÷-]\s*\d+\s*[=?]?\s*$)/i;

const SHORT_FOLLOW_UP_MAX_LENGTH: number = 120;

const isClearlyOffTopic = (message: string): boolean =>
  CLEARLY_OFF_TOPIC_PATTERN.test(message.trim());

const isAssistantMessageContent = (
  content: unknown,
): content is AssistantMessageContent => {
  if (typeof content === "string") {
    return true;
  }

  if (!Array.isArray(content)) {
    return false;
  }

  return content.every(
    (part: unknown): part is TextMessagePart =>
      typeof part === "object" &&
      part !== null &&
      "type" in part &&
      (part as TextMessagePart).type === "text" &&
      "text" in part &&
      typeof (part as TextMessagePart).text === "string",
  );
};

const getMessageText = (content: unknown): string => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!isAssistantMessageContent(content)) {
    return "";
  }

  return getAssistantMessageText(content).trim();
};

const getLastAssistantMessageText = (
  messages: ReadonlyArray<ChatMessageLike>,
): string => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message?.role !== "assistant") {
      continue;
    }

    const text: string = getMessageText(message.content);

    if (text.length > 0) {
      return text;
    }
  }

  return "";
};

/** True when the message matches the multilingual travel-topic allowlist. */
const hasOnTopicSignal = (message: string): boolean => {
  const trimmed: string = message.trim();
  const normalized: string = normalizeTopicText(trimmed);

  return (
    TRAVEL_TOPIC_PATTERN.test(trimmed) || TRAVEL_TOPIC_PATTERN.test(normalized)
  );
};

const isAssistantAwaitingReply = (
  messages: ReadonlyArray<ChatMessageLike>,
): boolean => {
  const lastAssistantText: string = getLastAssistantMessageText(messages);

  if (!lastAssistantText) {
    return false;
  }

  return /[?？]/.test(lastAssistantText);
};

/**
 * True when the message should reach the travel agent.
 * Allowlist: multilingual travel keywords / tier-1 intents / in-thread follow-ups.
 * Place names are not guessed here — the agent validates locations after the gate.
 */
export const isTravelPlannerRelatedMessage = (
  message: string,
  agentMessages: ReadonlyArray<ChatMessageLike> = [],
): boolean => {
  const trimmed: string = message.trim();

  if (!trimmed) {
    return false;
  }

  if (isClearlyOffTopic(trimmed)) {
    return false;
  }

  const normalized: string = normalizeTopicText(trimmed);

  const tier1Match: boolean =
    isRetryChatMessage(trimmed) ||
    isGenerateItineraryChatIntent(trimmed) ||
    isGenerateConfirmChatIntent(trimmed) ||
    isBookingSearchChatIntent(trimmed) ||
    messageHasTravelDates(trimmed) ||
    messageHasDepartureOrigin(trimmed);

  if (tier1Match) {
    return true;
  }

  if (hasOnTopicSignal(trimmed)) {
    return true;
  }

  const followUpAllowed: boolean =
    normalized.length > 0 &&
    normalized.length <= SHORT_FOLLOW_UP_MAX_LENGTH &&
    isAssistantAwaitingReply(agentMessages);

  if (followUpAllowed) {
    return true;
  }

  return false;
};

/** Static assistant reply for off-topic chat — no agent or tool calls. */
export const buildTopicDeclinePrompt = (): string => TOPIC_DECLINE_MESSAGE;
