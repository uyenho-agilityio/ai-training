"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";

import {
  Input,
  SuggestionView,
  SystemMessage,
  TypingIndicator,
  UserMessage,
  WelcomeScreen,
} from "@/components";
import { COPILOT_SIDEBAR_LABELS } from "@/constants";
import { useMessagePersistence } from "@/hooks/useMessagePersistence";

export const ChatWithPersistence = () => {
  const { isNewChat } = useMessagePersistence();

  return (
    <CopilotSidebar
      defaultOpen
      attachments={{ enabled: true }}
      welcomeScreen={isNewChat ? WelcomeScreen : false}
      suggestionView={SuggestionView}
      input={Input}
      messageView={{
        userMessage: UserMessage,
        assistantMessage: SystemMessage,
        cursor: TypingIndicator,
      }}
      labels={COPILOT_SIDEBAR_LABELS}
    />
  );
};
