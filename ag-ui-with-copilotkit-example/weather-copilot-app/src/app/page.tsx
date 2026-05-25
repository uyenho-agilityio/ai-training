import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import { WeatherCard, WeatherInfo } from "../components";

export default function Home() {
  return (
    <CopilotKit
      runtimeUrl="http://localhost:4111/chat"
      agent="weatherAgent"
      enableInspector
    >
      <WeatherCard />
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
