"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";

import { useMessagesStore } from "@/stores";

const ChatWithPersistence = dynamic(
  () =>
    import("@/components/ChatWithPersistence").then(
      (mod) => mod.ChatWithPersistence
    ),
  { ssr: false }
);

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const threadId = useMessagesStore((s) => s.threadId);
  const ensureThreadId = useMessagesStore((s) => s.ensureThreadId);

  useEffect(() => {
    if (!threadId) {
      ensureThreadId();
    }
  }, [threadId, ensureThreadId]);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
      <ChatWithPersistence />
    </CopilotKit>
  );
};
