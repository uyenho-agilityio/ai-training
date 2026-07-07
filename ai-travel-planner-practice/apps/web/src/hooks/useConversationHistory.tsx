"use client";

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import type {
  ConversationHistoryContextValue,
  ConversationSummary,
} from "@/types";
import {
  DEFAULT_CONVERSATION_TITLE,
  NEW_CONVERSATION_PREVIEW,
} from "@/constants";
import {
  createMemoryThread,
  deleteMemoryThread,
  fetchConversationSummaries,
  formatLocationTripTitle,
  updateMemoryThreadTitle,
} from "@/utils";

const ConversationHistoryContext =
  createContext<ConversationHistoryContextValue | null>(null);

type ConversationHistoryProviderProps = {
  children: ReactNode;
  threadId: string;
  initialConversations: ConversationSummary[];
  onThreadIdChange: (threadId: string) => void;
};

const ConversationHistoryProviderComponent = ({
  children,
  threadId,
  initialConversations,
  onThreadIdChange,
}: ConversationHistoryProviderProps): ReactElement => {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [isListOpen, setIsListOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const activeConversationId = threadId;

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId),
    [activeConversationId, conversations],
  );

  const refreshConversations = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    setError(null);

    try {
      const summaries = await fetchConversationSummaries();
      setConversations(summaries);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh conversations.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const setConversationLocationTitle = useCallback(
    (id: string, location: string) => {
      const title = formatLocationTripTitle(location);

      if (!title || title === DEFAULT_CONVERSATION_TITLE) {
        return;
      }

      setConversations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, title, isNewTrip: false } : item,
        ),
      );

      const persistTitle = async (): Promise<void> => {
        try {
          await updateMemoryThreadTitle(id, title);
        } catch {
          // Title is already updated locally; ignore persistence failures.
        }
      };

      persistTitle();
    },
    [],
  );

  const openList = useCallback((): void => {
    setIsListOpen(true);
    refreshConversations();
  }, [refreshConversations]);

  const closeList = useCallback((): void => {
    setIsListOpen(false);
  }, []);

  const toggleList = useCallback((): void => {
    setIsListOpen((open) => {
      const nextOpen = !open;

      if (nextOpen) {
        refreshConversations();
      }

      return nextOpen;
    });
  }, [refreshConversations]);

  const selectConversation = useCallback(
    (id: string) => {
      if (id === threadId) {
        setIsListOpen(false);
        return;
      }

      setIsSwitching(true);
      onThreadIdChange(id);
      setIsListOpen(false);
      setIsSwitching(false);
    },
    [onThreadIdChange, threadId],
  );

  const createConversation = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const nextThreadId = crypto.randomUUID();
      const created = await createMemoryThread(
        nextThreadId,
        DEFAULT_CONVERSATION_TITLE,
      );

      const nextConversation: ConversationSummary = {
        id: created.id,
        title: DEFAULT_CONVERSATION_TITLE,
        preview: NEW_CONVERSATION_PREVIEW,
        updatedAt: Date.now(),
        isNewTrip: true,
      };

      setConversations((current) => [nextConversation, ...current]);
      onThreadIdChange(nextThreadId);
      setIsListOpen(false);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create a new conversation.";
      setError(message);
    }
  }, [onThreadIdChange]);

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      if (deletingConversationId === id) {
        return;
      }

      setError(null);
      setDeletingConversationId(id);

      const previousConversations = conversations;

      const remaining = conversations.filter((item) => item.id !== id);
      setConversations(remaining);

      try {
        await deleteMemoryThread(id);

        if (remaining.length === 0) {
          const nextThreadId = crypto.randomUUID();
          const created = await createMemoryThread(
            nextThreadId,
            DEFAULT_CONVERSATION_TITLE,
          );

          setConversations([
            {
              id: created.id,
              title: DEFAULT_CONVERSATION_TITLE,
              preview: NEW_CONVERSATION_PREVIEW,
              updatedAt: Date.now(),
              isNewTrip: true,
            },
          ]);
          onThreadIdChange(nextThreadId);
        } else if (threadId === id) {
          const nextThreadId = remaining[0]?.id;

          if (nextThreadId) {
            onThreadIdChange(nextThreadId);
          }
        }
      } catch (deleteError) {
        setConversations(previousConversations);

        const message =
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete conversation.";
        setError(message);
      } finally {
        setDeletingConversationId(null);
      }
    },
    [conversations, deletingConversationId, onThreadIdChange, threadId],
  );

  const value = useMemo<ConversationHistoryContextValue>(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      isListOpen,
      isLoading: isRefreshing,
      isSwitching,
      deletingConversationId,
      error,
      openList,
      closeList,
      toggleList,
      selectConversation,
      createConversation,
      deleteConversation,
      refreshConversations,
      setConversationLocationTitle,
    }),
    [
      activeConversation,
      activeConversationId,
      closeList,
      conversations,
      createConversation,
      deleteConversation,
      deletingConversationId,
      error,
      isListOpen,
      isRefreshing,
      isSwitching,
      openList,
      refreshConversations,
      selectConversation,
      setConversationLocationTitle,
      toggleList,
    ],
  );

  return (
    <ConversationHistoryContext.Provider value={value}>
      {children}
    </ConversationHistoryContext.Provider>
  );
};

export const ConversationHistoryProvider = memo(
  ConversationHistoryProviderComponent,
);

export const useConversationHistory = (): ConversationHistoryContextValue => {
  const context = useContext(ConversationHistoryContext);

  if (!context) {
    throw new Error(
      "useConversationHistory must be used within ConversationHistoryProvider",
    );
  }

  return context;
};
