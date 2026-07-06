"use client";

import { useCallback } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

import { copilotAgent } from "@/constants";

import {
  getDisplayInsertIndex,
  useDisplayOnlyChat,
} from "./useDisplayOnlyChat";

type RunAgentMessageOptions = {
  appendUserMessage?: boolean;
};

type UseRunAgentMessageReturn = {
  appendUserChatMessage: (content: string) => void;
  appendCanvasChatOnlyUserMessage: (content: string) => void;
  runAgentMessage: (
    content: string,
    options?: RunAgentMessageOptions,
  ) => Promise<void>;
};

export const useRunAgentMessage = (): UseRunAgentMessageReturn => {
  const { agent } = useAgent({ agentId: copilotAgent });
  const { copilotkit } = useCopilotKit();
  const { appendDisplayOnlyMessage } = useDisplayOnlyChat();

  const appendUserChatMessage = useCallback(
    (content: string): void => {
      const trimmed: string = content.trim();

      if (!trimmed) {
        return;
      }

      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      });
    },
    [agent],
  );

  const appendCanvasChatOnlyUserMessage = useCallback(
    (content: string): void => {
      appendDisplayOnlyMessage(content, getDisplayInsertIndex(agent.messages));
    },
    [agent, appendDisplayOnlyMessage],
  );

  const runAgentMessage = useCallback(
    async (
      content: string,
      options?: RunAgentMessageOptions,
    ): Promise<void> => {
      const trimmed: string = content.trim();

      if (!trimmed) {
        return;
      }

      if (options?.appendUserMessage !== false) {
        appendUserChatMessage(trimmed);
      }

      await copilotkit.runAgent({ agent });
    },
    [agent, appendUserChatMessage, copilotkit],
  );

  return {
    appendUserChatMessage,
    appendCanvasChatOnlyUserMessage,
    runAgentMessage,
  };
};
