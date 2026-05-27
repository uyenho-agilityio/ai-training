"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotKitCoreErrorCode } from "@copilotkit/core";

import {
  COPILOT_CHAT_INITIAL,
  COPILOT_OBSERVABILITY_HOOKS,
  MASTRA_CHAT_URL,
} from "../constants";
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
      publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}
      enableInspector={process.env.NODE_ENV === "development"}
      onError={({ error, context }) => {
        console.error("CopilotKit Error:", { error, context });
        const code = context?.request?.operation;

        switch (code) {
          case CopilotKitCoreErrorCode.AGENT_RUN_FAILED:
          case CopilotKitCoreErrorCode.AGENT_RUN_ERROR_EVENT:
            console.error("Agent run failed", context);
            break;
          case CopilotKitCoreErrorCode.RUNTIME_INFO_FETCH_FAILED:
            console.error(
              "Runtime unreachable — check MASTRA_CHAT_URL & mastra dev",
              context
            );
            break;
          case CopilotKitCoreErrorCode.TOOL_HANDLER_FAILED:
          case CopilotKitCoreErrorCode.TOOL_ARGUMENT_PARSE_FAILED:
            console.error("Tool error", context);
            break;
          case CopilotKitCoreErrorCode.AGENT_THREAD_LOCKED:
            console.warn(
              "Thread locked, another session might be active",
              context
            );
            break;
        }
      }}
    >
      <HideInternalToolCalls />
      <WeatherCard />
      <WeatherConfirmation />
      <CopilotSidebar
        defaultOpen
        observabilityHooks={COPILOT_OBSERVABILITY_HOOKS}
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
