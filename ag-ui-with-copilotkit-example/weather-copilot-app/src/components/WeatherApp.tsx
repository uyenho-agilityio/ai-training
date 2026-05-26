"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";

import { COPILOT_CHAT_INITIAL, MASTRA_CHAT_URL } from "../constants";
import { useChatThread } from "../hooks";
import { ChatThreadProvider } from "./ChatThreadProvider";
import { CopilotSidebarHeader } from "./CopilotSidebarHeader";
import { HideInternalToolCalls } from "./HideInternalToolCalls";
import { Spinner } from "./Spinner";
import { SyncCopilotHistory } from "./SyncCopilotHistory";
import { WeatherCard } from "./WeatherCard";
import { WeatherConfirmation } from "./WeatherConfirmation";
import { WeatherInfo } from "./WeatherInfo";

const WeatherAppContent = () => {
  const { threadId, isReady, showGreeting, error } = useChatThread();

  if (!isReady || !threadId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Spinner label="Loading chat" />
        )}
      </div>
    );
  }

  return (
    <CopilotKit
      key={threadId}
      runtimeUrl={MASTRA_CHAT_URL}
      agent="weatherAgent"
      threadId={threadId}
      enableInspector={process.env.NODE_ENV === "development"}
    >
      <HideInternalToolCalls />
      <WeatherCard />
      <WeatherConfirmation />
      <CopilotSidebar
        defaultOpen
        Header={CopilotSidebarHeader}
        labels={{
          title: "Weather Agent",
          initial: showGreeting ? COPILOT_CHAT_INITIAL : "",
        }}
      >
        <SyncCopilotHistory />
        <main className="flex min-h-screen w-full justify-center bg-white px-4 py-8 lg:px-8">
          <WeatherInfo />
        </main>
      </CopilotSidebar>
    </CopilotKit>
  );
};

export const WeatherApp = () => (
  <ChatThreadProvider>
    <WeatherAppContent />
  </ChatThreadProvider>
);
