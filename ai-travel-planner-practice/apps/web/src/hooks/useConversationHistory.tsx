"use client";

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  MOCK_CONVERSATIONS,
  NEW_CONVERSATION_PREVIEW,
  NEW_CONVERSATION_TITLE,
} from "@/constants";
import type {
  ConversationHistoryContextValue,
  ConversationSummary,
} from "@/types";

const ConversationHistoryContext =
  createContext<ConversationHistoryContextValue | null>(null);

type ConversationHistoryProviderProps = {
  children: ReactNode;
};

const ConversationHistoryProviderComponent = ({
  children,
}: ConversationHistoryProviderProps): ReactElement => {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    MOCK_CONVERSATIONS[0]?.id ?? ""
  );
  const [isListOpen, setIsListOpen] = useState<boolean>(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId),
    [activeConversationId, conversations]
  );

  const openList = useCallback((): void => {
    setIsListOpen(true);
  }, []);

  const closeList = useCallback((): void => {
    setIsListOpen(false);
  }, []);

  const toggleList = useCallback((): void => {
    setIsListOpen((open) => !open);
  }, []);

  const selectConversation = useCallback((id: string): void => {
    setActiveConversationId(id);
    setIsListOpen(false);
    // Phase 2: pass id as CopilotKit threadId and hydrate agent + canvas state.
  }, []);

  const createConversation = useCallback((): void => {
    const nextConversation: ConversationSummary = {
      id: crypto.randomUUID(),
      title: NEW_CONVERSATION_TITLE,
      preview: NEW_CONVERSATION_PREVIEW,
      updatedAt: Date.now(),
    };

    setConversations((current) => [nextConversation, ...current]);
    setActiveConversationId(nextConversation.id);
    setIsListOpen(false);
    // Phase 2: create Mastra thread and reset chat/canvas for the new id.
  }, []);

  const deleteConversation = useCallback((id: string): void => {
    setConversations((current) => {
      if (current.length <= 1) {
        return current;
      }

      const next = current.filter((item) => item.id !== id);

      setActiveConversationId((activeId) => {
        if (activeId !== id) {
          return activeId;
        }

        return next[0]?.id ?? "";
      });

      return next;
    });
    // Phase 2: delete Mastra thread when backend supports it.
  }, []);

  const value = useMemo<ConversationHistoryContextValue>(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      isListOpen,
      openList,
      closeList,
      toggleList,
      selectConversation,
      createConversation,
      deleteConversation,
    }),
    [
      activeConversation,
      activeConversationId,
      closeList,
      conversations,
      createConversation,
      deleteConversation,
      isListOpen,
      openList,
      selectConversation,
      toggleList,
    ]
  );

  return (
    <ConversationHistoryContext.Provider value={value}>
      {children}
    </ConversationHistoryContext.Provider>
  );
};

export const ConversationHistoryProvider = memo(
  ConversationHistoryProviderComponent
);

export const useConversationHistory = (): ConversationHistoryContextValue => {
  const context = useContext(ConversationHistoryContext);

  if (!context) {
    throw new Error(
      "useConversationHistory must be used within ConversationHistoryProvider"
    );
  }

  return context;
};
