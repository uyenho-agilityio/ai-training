import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import { copilotAgent, copilotRuntimeUrl } from "@/constants";
import {
  ChatInput,
  ChatMessages,
  ConversationHistoryHeader,
  copilotSidebarClasses,
  SystemMessage,
  UserMessage,
  TravelCanvas,
  ToolConfirmation,
} from "@/components";
import {
  ConversationHistoryProvider,
  DisplayOnlyChatProvider,
} from "@/hooks";

const Home = () => (
  <CopilotKit runtimeUrl={copilotRuntimeUrl} agent={copilotAgent}>
    <ConversationHistoryProvider>
      <DisplayOnlyChatProvider>
        <div className="flex min-h-screen w-full flex-col sm:flex-row">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <TravelCanvas />
          </div>

          <CopilotSidebar
            defaultOpen
            clickOutsideToClose={false}
            className={copilotSidebarClasses}
            Header={ConversationHistoryHeader}
            labels={{
              title: "AI Assistant",
              initial: "Hi! 👋 How can I help you with your travel plans?",
              placeholder: "Tell me about your trip...",
            }}
            Messages={ChatMessages}
            UserMessage={UserMessage}
            AssistantMessage={SystemMessage}
            Input={ChatInput}
          />
          <ToolConfirmation />
        </div>
      </DisplayOnlyChatProvider>
    </ConversationHistoryProvider>
  </CopilotKit>
);

export default Home;
