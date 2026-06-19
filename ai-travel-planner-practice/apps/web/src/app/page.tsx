import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4111/chat" agent="weatherAgent">
      <CopilotSidebar
        defaultOpen
        labels={{
          title: "AI Travel Planner",
          initial: "Hi! 👋 How can I help you with your travel plans?",
        }}
      />
    </CopilotKit>
  );
}
