"use client";

import { useCallback } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

import { copilotAgent } from "@/constants";

type UseRunAgentMessageReturn = {
  runAgentMessage: (content: string) => Promise<void>;
};

export const useRunAgentMessage = (): UseRunAgentMessageReturn => {
  const { agent } = useAgent({ agentId: copilotAgent });
  const { copilotkit } = useCopilotKit();

  const runAgentMessage = useCallback(
    async (content: string): Promise<void> => {
      const trimmed: string = content.trim();

      if (!trimmed) {
        return;
      }

      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      });

      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  return { runAgentMessage };
};
