"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { TodoList } from "@/components";

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
        defaultOpen={false}
        labels={{
          modalHeaderTitle: "CopilotKit Chat",
          welcomeMessageText: "Hi you! I can help you manage your todo list.",
          chatInputPlaceholder: "Type a message...",
          chatDisclaimerText:
            "AI can make mistakes. Please verify important information.",
        }}
      />
    </>
  );
}
