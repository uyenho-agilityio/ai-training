"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import { copilotAgent, copilotRuntimeUrl } from "@/constants";
import {
  ChatInput,
  ChatMessages,
  ConversationHistoryHeader,
  copilotSidebarClasses,
  LoadingIndicator,
  SystemMessage,
  UserMessage,
  TravelCanvas,
  ToolConfirmation,
} from "@/components";
import {
  NEW_CONVERSATION_PREVIEW,
  DEFAULT_CONVERSATION_TITLE,
} from "@/constants";
import { ConversationHistoryProvider, DisplayOnlyChatProvider } from "@/hooks";
import type { ConversationSummary } from "@/types";
import {
  createMemoryThread,
  fetchConversationSummaries,
  resolveBootErrorMessage,
} from "@/utils";

type BootState = {
  threadId: string;
  conversations: ConversationSummary[];
};

const TravelAppShellComponent = (): ReactElement => {
  const [bootState, setBootState] = useState<BootState | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootThread = async (): Promise<void> => {
      try {
        let summaries = await fetchConversationSummaries();

        if (summaries.length === 0) {
          const newThreadId = crypto.randomUUID();
          await createMemoryThread(newThreadId, DEFAULT_CONVERSATION_TITLE);
          summaries = [
            {
              id: newThreadId,
              title: DEFAULT_CONVERSATION_TITLE,
              preview: NEW_CONVERSATION_PREVIEW,
              updatedAt: Date.now(),
              isNewTrip: true,
            },
          ];
        }

        const nextThreadId = summaries[0]?.id;

        if (!nextThreadId || cancelled) {
          return;
        }

        if (!cancelled) {
          setBootState({
            threadId: nextThreadId,
            conversations: summaries,
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setBootError(resolveBootErrorMessage(error));
      }
    };

    bootThread();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleThreadIdChange = useCallback((nextThreadId: string): void => {
    setBootState((current) =>
      current
        ? {
            ...current,
            threadId: nextThreadId,
          }
        : current,
    );
  }, []);

  const bootContent = useMemo((): ReactElement => {
    if (bootError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6 text-sm text-red-600">
          {bootError}
        </div>
      );
    }

    if (!bootState) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <LoadingIndicator
            layout="centered"
            size="md"
            aria-label="Loading conversations"
          />
        </div>
      );
    }

    return (
      <CopilotKit
        runtimeUrl={copilotRuntimeUrl}
        agent={copilotAgent}
        threadId={bootState.threadId}
      >
        <ConversationHistoryProvider
          threadId={bootState.threadId}
          initialConversations={bootState.conversations}
          onThreadIdChange={handleThreadIdChange}
        >
          <DisplayOnlyChatProvider threadId={bootState.threadId}>
            <div className="flex min-h-screen w-full flex-col sm:flex-row">
              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                <TravelCanvas key={bootState.threadId} />
              </div>

              <CopilotSidebar
                key={bootState.threadId}
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
  }, [bootError, bootState, handleThreadIdChange]);

  return bootContent;
};

export const TravelAppShell = memo(TravelAppShellComponent);
