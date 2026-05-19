"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
import {
  Input,
  SystemMessage,
  TodoList,
  SuggestionView,
  TypingIndicator,
  UserMessage,
  WelcomeScreen,
} from "@/components";

export default function Page() {
  return (
    <>
      <main className="todos-page">
        <div className="todos-container">
          <h1 className="todos-title">✍️ My Todos</h1>
          <TodoList />
        </div>
      </main>

      <CopilotSidebar
        defaultOpen
        attachments={{ enabled: true }}
        welcomeScreen={WelcomeScreen}
        suggestionView={SuggestionView}
        input={Input}
        messageView={{
          userMessage: UserMessage,
          assistantMessage: SystemMessage,
          cursor: TypingIndicator,
        }}
        labels={{
          modalHeaderTitle: "Todo Assistant",
          welcomeMessageText: "Hi! I can help you manage your todo list.",
          chatInputPlaceholder: "Ask about your todos...",
          chatDisclaimerText:
            "AI can make mistakes. Please verify important information.",
        }}
      />
    </>
  );
}
