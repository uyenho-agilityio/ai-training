"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";

import { useApiKey } from "@/hooks";
import { useApiKeyStore, useMessagesStore } from "@/stores";
import { readPersistedApiKey } from "@/utils/apiKeyStorage";
import { OPENAI_API_KEY_HEADER } from "@/constants";

const ChatWithPersistence = dynamic(
  () =>
    import("@/components/ChatWithPersistence").then(
      (mod) => mod.ChatWithPersistence
    ),
  { ssr: false }
);

const getOpenAiHeaders = (): Record<string, string> => {
  const key = useApiKeyStore.getState().apiKey.trim() || readPersistedApiKey();
  return key ? { [OPENAI_API_KEY_HEADER]: key } : {};
};

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const { hasApiKey } = useApiKey();
  const threadId = useMessagesStore((s) => s.threadId);
  const ensureThreadId = useMessagesStore((s) => s.ensureThreadId);

  useEffect(() => {
    if (!threadId) {
      ensureThreadId();
    }
  }, [threadId, ensureThreadId]);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" headers={getOpenAiHeaders}>
      {children}
      {hasApiKey ? <ChatWithPersistence /> : null}
    </CopilotKit>
  );
};
