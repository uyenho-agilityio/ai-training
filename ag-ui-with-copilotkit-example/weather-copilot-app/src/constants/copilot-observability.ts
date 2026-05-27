import type { CopilotObservabilityHooks } from "@copilotkit/react-ui";

const LOG_PREFIX = "[CopilotKit Observability]";

const logEvent = (event: string, payload?: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.log(LOG_PREFIX, event, payload ?? "");
};

export const COPILOT_OBSERVABILITY_HOOKS: CopilotObservabilityHooks = {
  onMessageSent: (message) => {
    logEvent("message_sent", {
      length: message.length,
      preview: message.slice(0, 120),
    });
  },
  onChatExpanded: () => {
    logEvent("chat_expanded");
  },
  onChatMinimized: () => {
    logEvent("chat_minimized");
  },
  onMessageRegenerated: (messageId) => {
    logEvent("message_regenerated", { messageId });
  },
  onMessageCopied: (content) => {
    logEvent("message_copied", { length: content.length });
  },
  onFeedbackGiven: (messageId, type) => {
    logEvent("feedback_given", { messageId, type });
  },
  onChatStarted: () => {
    logEvent("chat_started");
  },
  onChatStopped: () => {
    logEvent("chat_stopped");
  },
  onError: (errorEvent) => {
    logEvent("chat_error", {
      type: errorEvent.type,
      source: errorEvent.context?.source,
      operation: errorEvent.context?.request?.operation,
      message: errorEvent.error?.message,
    });
  },
};
