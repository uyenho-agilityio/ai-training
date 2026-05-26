import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import {
  HideInternalToolCalls,
  WeatherCard,
  WeatherConfirmation,
  WeatherInfo,
} from "../components";

export default function Home() {
  return (
    <CopilotKit
      runtimeUrl={
        process.env.NEXT_PUBLIC_MASTRA_CHAT_URL ?? "http://localhost:4111/chat"
      }
      agent="weatherAgent"
      enableInspector={process.env.NODE_ENV === "development"}
    >
      <HideInternalToolCalls />
      <WeatherCard />
      <WeatherConfirmation />
      <CopilotSidebar
        defaultOpen
        labels={{
          title: "Weather Agent",
          initial: "Hi! 👋 Ask me about the weather, forecasts, and climate.",
        }}
      >
        <main className="flex min-h-screen w-full justify-center bg-white py-8">
          <WeatherInfo />
        </main>
      </CopilotSidebar>
    </CopilotKit>
  );
}
