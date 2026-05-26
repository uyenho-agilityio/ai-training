import type { Message } from "@copilotkit/runtime-client-gql";

export type MemoryThread = {
  id: string;
  resourceId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
};

export type MemoryMessage = {
  id: string;
  role: string;
  content?: unknown;
  createdAt?: string;
};

export type ListThreadsResponse = {
  threads: MemoryThread[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
};

export type ListMessagesResponse = {
  messages: MemoryMessage[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
};

export type ChatThreadState = {
  threadId: string;
  messages: MemoryMessage[];
  showGreeting: boolean;
};

export type ChatThreadContextValue = {
  threadId: string | null;
  isReady: boolean;
  showGreeting: boolean;
  copilotMessages: Message[];
  error: string | null;
  startNewThread: () => void;
};
