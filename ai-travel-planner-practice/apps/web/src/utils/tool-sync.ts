import type { CopilotMessage, MastraThreadMessage } from "@/types";

type ToolResultMessage = {
  toolName: string;
  payload: unknown;
};

const getToolCallName = (
  toolCall: NonNullable<CopilotMessage["toolCalls"]>[number],
): string => {
  const extended = toolCall as {
    function?: { name?: string };
    name?: string;
  };

  return extended.function?.name ?? extended.name ?? "";
};

/** Collect tool name + payload pairs from CopilotKit / AG-UI chat messages. */
export const collectToolResultMessages = (
  messages: readonly CopilotMessage[],
): ToolResultMessage[] => {
  const results: ToolResultMessage[] = [];
  const toolCallNames = new Map<string, string>();

  for (const message of messages) {
    if (
      message.role?.toLowerCase() !== "assistant" ||
      !message.toolCalls?.length
    ) {
      continue;
    }

    for (const toolCall of message.toolCalls) {
      const toolName: string = getToolCallName(toolCall);

      if (toolCall.id && toolName) {
        toolCallNames.set(toolCall.id, toolName);
      }
    }
  }

  for (const message of messages) {
    const role: string = message.role?.toLowerCase() ?? "";

    if (role === "tool" && message.content != null) {
      const extended = message as CopilotMessage & {
        name?: string;
        toolName?: string;
      };
      const toolName: string =
        extended.name ??
        extended.toolName ??
        (message.toolCallId
          ? (toolCallNames.get(message.toolCallId) ?? "")
          : "");

      if (toolName) {
        results.push({ toolName, payload: message.content });
      }

      continue;
    }

    if (role !== "assistant" || !message.toolCalls?.length) {
      continue;
    }

    for (const toolCall of message.toolCalls) {
      const toolName: string = getToolCallName(toolCall);
      const toolMessage = messages.find(
        (entry: CopilotMessage) =>
          entry.role?.toLowerCase() === "tool" &&
          entry.toolCallId === toolCall.id,
      );

      if (!toolName || toolMessage?.content == null) {
        continue;
      }

      results.push({ toolName, payload: toolMessage.content });
    }
  }

  return results;
};

type MastraToolInvocationPart = {
  type?: string;
  toolInvocation?: {
    state?: string;
    toolName?: string;
    result?: unknown;
  };
};

/** Collect tool name + payload pairs from Mastra memory thread messages. */
export const collectToolResultsFromMastraMessages = (
  messages: readonly MastraThreadMessage[],
): ToolResultMessage[] => {
  const results: ToolResultMessage[] = [];

  for (const message of messages) {
    const content = message.content;

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      continue;
    }

    const parts = (content as { parts?: MastraToolInvocationPart[] }).parts;

    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
      const invocation = part.toolInvocation;

      if (
        part.type !== "tool-invocation" ||
        invocation?.state !== "result" ||
        !invocation.toolName ||
        invocation.result == null
      ) {
        continue;
      }

      results.push({
        toolName: invocation.toolName,
        payload: invocation.result,
      });
    }
  }

  return results;
};
