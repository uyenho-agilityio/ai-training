import { Message, Role, TextMessage } from "@copilotkit/runtime-client-gql";

import type { MemoryMessage } from "../types/memory";

type TextPart = { type?: string; text?: string };

const extractTextFromParts = (parts: unknown[]): string =>
  parts
    .flatMap((part) => {
      if (typeof part !== "object" || part === null) return [];
      const { type, text } = part as TextPart;
      return type === "text" && text ? [text] : [];
    })
    .join("\n");

const getMessageText = (message: MemoryMessage): string => {
  const { content } = message;
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return extractTextFromParts(content);
  }

  if (content && typeof content === "object") {
    const record = content as { content?: string; parts?: unknown[] };
    if (typeof record.content === "string" && record.content.trim()) {
      return record.content;
    }
    if (Array.isArray(record.parts)) {
      return extractTextFromParts(record.parts);
    }
  }

  return "";
};

/** Drop duplicate Mastra rows (CopilotKit may resend the full history). */
const dedupeMastraMessages = (messages: MemoryMessage[]): MemoryMessage[] => {
  const seenIds = new Set<string>();
  const byKey = new Map<string, MemoryMessage>();
  const keyOrder: string[] = [];

  for (const message of messages) {
    if (seenIds.has(message.id)) continue;
    seenIds.add(message.id);

    const text = getMessageText(message).trim();
    if (message.role === "assistant" && !text) continue;

    const key = `${message.role}:${text}`;
    if (!text && message.role !== "user") continue;

    if (!byKey.has(key)) keyOrder.push(key);
    byKey.set(key, message);
  }

  return keyOrder.map((key) => byKey.get(key)!);
};

const toCopilotRole = (role: string) => {
  if (role === "user") return Role.User;
  if (role === "assistant") return Role.Assistant;
  if (role === "system") return Role.System;
  return null;
};

export const toCopilotKitMessages = (messages: MemoryMessage[]): Message[] =>
  dedupeMastraMessages(messages).flatMap((message) => {
    const role = toCopilotRole(message.role);
    const text = getMessageText(message).trim();
    if (!role || !text) return [];

    return [
      new TextMessage({
        id: message.id,
        role,
        content: text,
      }),
    ];
  });
