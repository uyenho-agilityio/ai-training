"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ChatThreadContextValue, ChatThreadState, MemoryMessage } from "../types";
import { toCopilotKitMessages } from "../utils/chat-history";
import {
  createEmptyThreadState,
  createThreadId,
  loadLatestThreadFromMemory,
} from "../utils/chat-thread";

export const useChatThreadState = (): ChatThreadContextValue => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [mastraMessages, setMastraMessages] = useState<MemoryMessage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copilotMessages = useMemo(
    () => toCopilotKitMessages(mastraMessages),
    [mastraMessages],
  );

  const applyThreadState = useCallback((state: ChatThreadState) => {
    setThreadId(state.threadId);
    setMastraMessages(state.messages);
    setShowGreeting(state.showGreeting);
  }, []);

  const startNewThread = useCallback(() => {
    applyThreadState(createEmptyThreadState());
    setError(null);
  }, [applyThreadState]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsReady(false);
      setError(null);

      try {
        const state = await loadLatestThreadFromMemory();
        if (cancelled) return;
        applyThreadState(state);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load chat");
        applyThreadState({
          ...createEmptyThreadState(),
          threadId: createThreadId(),
        });
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [applyThreadState]);

  return {
    threadId,
    isReady,
    showGreeting,
    copilotMessages,
    error,
    startNewThread,
  };
};
