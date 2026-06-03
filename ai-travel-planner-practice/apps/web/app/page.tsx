import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4111/chat" agent="weatherAgent">
      <CopilotSidebar
        defaultOpen
        labels={{
          title: "Weather Agent",
          initial: "Hi! 👋 Ask me about the weather, forecasts, and climate.",
        }}
      />
    </CopilotKit>
  );
}
