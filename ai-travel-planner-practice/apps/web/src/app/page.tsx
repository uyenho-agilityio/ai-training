import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import { copilotAgent, copilotRuntimeUrl } from "@/constants";
import {
  ChatInput,
  copilotSidebarClasses,
  SystemMessage,
  UserMessage,
  TravelCanvas,
  ToolConfirmation,
} from "@/components";

const Home = () => (
  <CopilotKit runtimeUrl={copilotRuntimeUrl} agent={copilotAgent}>
    <div className="flex min-h-screen w-full flex-col sm:flex-row">
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <TravelCanvas />
      </div>

      <CopilotSidebar
        defaultOpen
        clickOutsideToClose={false}
        className={copilotSidebarClasses}
        labels={{
          title: "AI Assistant",
          initial: "Hi! 👋 How can I help you with your travel plans?",
          placeholder: "Tell me about your trip...",
        }}
        UserMessage={UserMessage}
        AssistantMessage={SystemMessage}
        Input={ChatInput}
      />
      <ToolConfirmation />
    </div>
  </CopilotKit>
);

export default Home;
