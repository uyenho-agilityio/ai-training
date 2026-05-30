import type { Message } from "@ag-ui/core";
import type OpenAI from "openai";

const messageContentToString = (content: Message["content"]): string => {
  if (typeof content === "string") return content;
  if (!content) return "";
  if (Array.isArray(content)) {
    return content
      .map((part) => ("text" in part && part.text ? part.text : ""))
      .join("");
  }
  return JSON.stringify(content);
};

export const getOpenAiMessages = (
  messages: Message[]
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] =>
  messages.map((message) => {
    if (message.role === "assistant") {
      return {
        role: "assistant",
        content: messageContentToString(message.content),
        ...(message.toolCalls?.length
          ? {
              tool_calls: message.toolCalls.map((toolCall) => ({
                id: toolCall.id,
                type: "function" as const,
                function: {
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                },
              })),
            }
          : {}),
      };
    }

    if (message.role === "tool") {
      return {
        role: "tool",
        tool_call_id: message.toolCallId ?? "",
        content: messageContentToString(message.content),
      };
    }

    return {
      role: message.role as "user" | "system",
      content: messageContentToString(message.content),
    };
  });
