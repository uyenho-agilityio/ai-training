"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import { useConversationHistory } from "@/hooks";
import { LoadingIndicator, Text } from "../../commons";
import { ConversationListItem } from "./ConversationListItem";

type ConversationListPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConversationListPanelComponent = ({
  isOpen,
  onClose,
}: ConversationListPanelProps): ReactElement | null => {
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    conversations,
    activeConversationId,
    isLoading,
    deletingConversationId,
    error,
    selectConversation,
    deleteConversation,
  } = useConversationHistory();

  const handleSelect = useCallback(
    (id: string) => {
      selectConversation(id);
      onClose();
    },
    [onClose, selectConversation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteConversation(id);
    },
    [deleteConversation],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    panelRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const shouldShowLoadingIndicator: boolean =
    isLoading && !conversations.length;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="absolute left-0 right-0 top-full z-50 max-h-80 overflow-y-auto rounded-b-xl border border-t-0 border-orange-300 bg-white p-1.5 shadow-lg shadow-orange-100/60 focus:outline-none"
      role="listbox"
      aria-label="Conversation history"
      onKeyDown={handleKeyDown}
    >
      {error && (
        <Text size="xs" color="accent" className="px-2 py-1.5 text-red-600">
          {error}
        </Text>
      )}

      {shouldShowLoadingIndicator && (
        <LoadingIndicator size="sm" layout="inline" className="px-2 py-3" />
      )}

      {!isLoading && !conversations.length && (
        <Text size="xs" color="muted" className="px-2 py-3">
          No conversations yet.
        </Text>
      )}

      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          isDeleting={deletingConversationId === conversation.id}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export const ConversationListPanel = memo(ConversationListPanelComponent);
