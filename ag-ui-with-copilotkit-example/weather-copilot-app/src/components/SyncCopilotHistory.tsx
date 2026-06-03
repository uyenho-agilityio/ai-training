"use client";

import { useCopilotChatInternal } from "@copilotkit/react-core";
import { useEffect, useRef } from "react";

import { useChatThread } from "../hooks";

export const SyncCopilotHistory = () => {
  const { threadId, copilotMessages } = useChatThread();
  const { setMessages, agent, isAvailable } = useCopilotChatInternal();
  const syncedThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!threadId || !isAvailable || !agent || copilotMessages.length === 0) {
      return;
    }
    if (syncedThreadRef.current === threadId) return;

    setMessages(copilotMessages);
    syncedThreadRef.current = threadId;
  }, [agent, copilotMessages, isAvailable, setMessages, threadId]);

  return null;
};
