"use client";

import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { useCallback, useEffect } from "react";

import { useStoresHydrated } from "@/components/StoresHydrationProvider";
import { useApiKey } from "@/hooks/useApiKey";
import { useMessagesStore } from "@/stores";
import { cloneMessages } from "@/utils";

/**
 * Client-side thread + message persistence (Zustand/localStorage)
 */
export const useMessagePersistence = () => {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const isHydrated = useStoresHydrated();
  const { hasApiKey } = useApiKey();
  const threadId = useMessagesStore((s) => s.threadId);
  const saveMessages = useMessagesStore((s) => s.saveMessages);
  const loadMessages = useMessagesStore((s) => s.loadMessages);
  const savedCount = useMessagesStore((s) =>
    threadId ? (s.messagesByThread[threadId]?.length ?? 0) : 0
  );
  const isNewChat = savedCount === 0;
  const runtimeConnected = copilotkit.runtimeConnectionStatus === "connected";

  const restoreMessages = useCallback(() => {
    if (!isHydrated || !hasApiKey || !agent || !threadId) return;
    if (agent.isRunning) return;

    const savedMessages = loadMessages(threadId) as Parameters<
      typeof agent.setMessages
    >[0];
    if (!savedMessages.length) return;

    // Re-apply when the runtime swaps provisional → connected agent instances.
    if (agent.messages.length >= savedMessages.length) return;

    agent.setMessages(
      cloneMessages(savedMessages) as Parameters<typeof agent.setMessages>[0]
    );
  }, [agent, hasApiKey, isHydrated, loadMessages, threadId]);

  useEffect(() => {
    restoreMessages();

    const frame = requestAnimationFrame(restoreMessages);
    const timeout = window.setTimeout(restoreMessages, 150);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [restoreMessages, runtimeConnected]);

  useEffect(() => {
    if (!agent || !threadId) return;

    const subscription = agent.subscribe({
      onMessagesChanged: ({ messages }) => {
        if ((agent.isRunning && messages.length === 0) || messages.length === 0)
          return;
        saveMessages(threadId, messages);
      },
    });

    return () => subscription.unsubscribe();
  }, [agent, saveMessages, threadId]);

  return { isNewChat };
};
