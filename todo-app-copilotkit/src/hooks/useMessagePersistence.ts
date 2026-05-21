"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";

import { useApiKey } from "@/hooks/useApiKey";
import { useMessagesStore } from "@/stores";

/**
 * Client-side thread + message persistence (Zustand/localStorage)
 */
export const useMessagePersistence = () => {
  const { agent } = useAgent();
  const { hasApiKey } = useApiKey();
  const threadId = useMessagesStore((s) => s.threadId);
  const saveMessages = useMessagesStore((s) => s.saveMessages);
  const loadMessages = useMessagesStore((s) => s.loadMessages);
  const savedCount = useMessagesStore((s) =>
    threadId ? (s.messagesByThread[threadId]?.length ?? 0) : 0
  );
  const isNewChat = savedCount === 0;

  const restoredThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasApiKey || !agent || !threadId) return;
    if (restoredThreadRef.current === threadId) return;
    if (agent.isRunning) return;

    const savedMessages = loadMessages(threadId) as Parameters<
      typeof agent.setMessages
    >[0];
    if (!savedMessages.length) {
      restoredThreadRef.current = threadId;
      return;
    }

    if (agent.messages.length > 0) {
      restoredThreadRef.current = threadId;
      return;
    }

    restoredThreadRef.current = threadId;
    agent.setMessages(savedMessages);
  }, [agent, loadMessages, hasApiKey, threadId]);

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

  return {
    isNewChat,
  };
};
