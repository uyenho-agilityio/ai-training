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
      <div className="flex min-h-screen bg-white">
        <section className="flex flex-1 justify-center items-start bg-white p-8 pt-10">
          <WeatherInfo />
        </section>
        <main className="min-w-0 flex-1">
          <CopilotSidebar
            defaultOpen
            labels={{
              title: "Weather Agent",
              initial:
                "Hi! 👋 Ask me about the weather, forecasts, and climate.",
            }}
          />
        </main>
      </div>
    </CopilotKit>
  );
}
