import type { ChatThreadState } from "../types";

import {
  listMemoryThreads,
  listThreadMessages,
  pickLatestThread,
} from "./mastra-memory";

export const createThreadId = () => crypto.randomUUID();

export const createEmptyThreadState = (): ChatThreadState => ({
  threadId: createThreadId(),
  messages: [],
  showGreeting: true,
});

/** Load the most recent Mastra thread (or start a blank one). */
export const loadLatestThreadFromMemory = async (): Promise<ChatThreadState> => {
  const threads = await listMemoryThreads();
  const latest = pickLatestThread(threads);

  if (!latest) {
    return createEmptyThreadState();
  }

  const messages = await listThreadMessages(latest.id);

  return {
    threadId: latest.id,
    messages,
    showGreeting: messages.length === 0,
  };
};