import { TOPIC_DECLINE_MESSAGE } from "@/constants";
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

type ChatMessageLike = {
  role?: string;
  content?: unknown;
};

/** Lowercase + strip diacritics so one pattern covers typed accents (e.g. VI → ASCII). */
export const normalizeTopicText = (message: string): string =>
  message.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/**
 * International travel loanwords + locale-neutral duration hints (not per-language lists).
 * Also matches original text for CJK travel terms.
 */
const TRAVEL_PLANNER_FEATURE_PATTERN: RegExp = new RegExp(
  String.raw`(?:` +
    String.raw`trip|travel(?:ing|er)?|vacation|holiday|getaway|itinerar(?:y)?|destination|destinations|` +
    String.raw`flight|flights|airfare|airline|ticket|tickets|fly(?:ing)?|` +
    String.raw`hotel|hotels|hostel|resort|accommodation|stay|booking|bookings|reserve|reservation|` +
    String.raw`weather|forecast|` +
    String.raw`place|places|spot|spots|attraction|attractions|sightseeing|landmark|landmarks|` +
    String.raw`visit|visiting|tourist|tourism|tour|explore|exploring|` +
    String.raw`airport|passport|visa|taxi|metro|transfer|` +
    String.raw`check-?in|check-?out|depart(?:ure)?|arrival|` +
    String.raw`sketch|star(?:red)?|canvas|` +
    String.raw`local tips?|day-?by-?day|route|routes|schedule|` +
    String.raw`beach(?:es)?|food|restaurant|museum|hiking|adventure|` +
    String.raw`plan(?:ning)?|suggest(?:ion)?s?|recommend(?:ation)?s?|` +
    String.raw`what to (?:see|do|visit)|where to (?:go|stay|eat)|` +
    String.raw`\d+\s*(?:days?|nights?|weeks?|ngay|jour|jours|nuits?|semaines?)` +
    String.raw`)|` +
    String.raw`[\u4e00-\u9fff]{2,}|` + // CJK place/activity phrases (e.g. 东京, 景点)
    String.raw`\d+\s*[\u65e5\u5929\u665a\u5bbf]|` + // e.g. 3日, 3天
    String.raw`[\u3040-\u30ff]{2,}|` + // Japanese kana/kanji clusters
    String.raw`[\uac00-\ud7af]{2,}`, // Korean hangul clusters
  "iu",
);

/** High-confidence off-topic intents (Latin / normalized ASCII only). */
const CLEARLY_OFF_TOPIC_PATTERN: RegExp =
  /(?:tell me (?:a )?joke|jokes?|funny story|make me laugh|write (?:me )?(?:a )?(?:code|poem|story|essay|song)|who (?:are|is) you|what(?:'s| is) (?:your|the) purpose|solve (?:this )?math|homework|recipe for|politics|election|stock market|crypto(?:currency)?|bitcoin|translate (?:this )?(?:sentence|text)|programming help|debug (?:my )?code)/i;

const SHORT_FOLLOW_UP_MAX_LENGTH: number = 120;

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

const isClearlyOffTopic = (normalizedMessage: string): boolean =>
  CLEARLY_OFF_TOPIC_PATTERN.test(normalizedMessage);

const hasTravelFeatureSignal = (message: string): boolean =>
  TRAVEL_PLANNER_FEATURE_PATTERN.test(message) ||
  TRAVEL_PLANNER_FEATURE_PATTERN.test(normalizeTopicText(message));

const isShortTravelFollowUp = (normalizedMessage: string): boolean =>
  normalizedMessage.length > 0 &&
  normalizedMessage.length <= SHORT_FOLLOW_UP_MAX_LENGTH &&
  !isClearlyOffTopic(normalizedMessage);

const isAssistantAwaitingReply = (
  messages: ReadonlyArray<ChatMessageLike>,
): boolean => {
  const lastAssistantText: string = getLastAssistantMessageText(messages);

  if (!lastAssistantText) {
    return false;
  }

  return /[?？]\s*$/.test(lastAssistantText);
};

/**
 * True when the message should reach the travel agent or its tools.
 * Policy: block only high-confidence off-topic; allow travel signals and uncertain
 * messages so the LLM can understand any language (agent declines off-topic without tools).
 */
export const isTravelPlannerRelatedMessage = (
  message: string,
  agentMessages: ReadonlyArray<ChatMessageLike> = [],
): boolean => {
  const trimmed: string = message.trim();

  if (!trimmed) {
    return false;
  }

  const normalized: string = normalizeTopicText(trimmed);

  if (isClearlyOffTopic(normalized)) {
    return false;
  }

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

  if (hasTravelFeatureSignal(trimmed)) {
    return true;
  }

  const followUpAllowed: boolean =
    isShortTravelFollowUp(normalized) &&
    isAssistantAwaitingReply(agentMessages);

  if (followUpAllowed) {
    return true;
  }

  return true;
};

/** Static assistant reply for clearly off-topic chat — no agent or tool calls. */
export const buildTopicDeclinePrompt = (): string => TOPIC_DECLINE_MESSAGE;
