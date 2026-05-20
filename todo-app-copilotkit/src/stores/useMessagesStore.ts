import { create } from "zustand";
import { persist } from "zustand/middleware";

import { cloneMessages } from "@/utils";

interface MessagesStoreState {
  threadId: string;
  messagesByThread: Record<string, unknown[]>;
  ensureThreadId: () => string;
  setThreadId: (threadId: string) => void;
  startNewThread: () => string;
  saveMessages: (threadId: string, messages: readonly unknown[]) => void;
  loadMessages: (threadId: string) => unknown[];
}

export const useMessagesStore = create<MessagesStoreState>()(
  persist(
    (set, get) => ({
      threadId: "",
      messagesByThread: {},
      ensureThreadId: () => {
        const existing = get().threadId;
        if (existing) return existing;
        const id = crypto.randomUUID();
        set({ threadId: id });
        return id;
      },
      setThreadId: (threadId) => set({ threadId }),
      startNewThread: () => {
        const id = crypto.randomUUID();
        set({ threadId: id });
        return id;
      },
      saveMessages: (threadId, messages) =>
        set((state) => ({
          messagesByThread: {
            ...state.messagesByThread,
            [threadId]: cloneMessages([...messages]),
          },
        })),
      loadMessages: (threadId) => get().messagesByThread[threadId] ?? [],
    }),
    {
      name: "messages_storage",
      partialize: (state) => ({
        threadId: state.threadId,
        messagesByThread: state.messagesByThread,
      }),
    }
  )
);
