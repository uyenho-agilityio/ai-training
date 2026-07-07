"use client";

import { memo, useCallback, type MouseEvent, type ReactElement } from "react";

import { CloseIcon } from "@/icons";
import { cn, formatConversationUpdatedAt } from "@/utils";
import type { ConversationSummary } from "@/types";
import { Button } from "../../commons";

type ConversationListItemProps = {
  conversation: ConversationSummary;
  isActive: boolean;
  canDelete: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const ConversationListItemComponent = ({
  conversation,
  isActive,
  canDelete,
  onSelect,
  onDelete,
}: ConversationListItemProps): ReactElement => {
  const handleSelect = useCallback((): void => {
    onSelect(conversation.id);
  }, [conversation.id, onSelect]);

  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();
      onDelete(conversation.id);
    },
    [conversation.id, onDelete]
  );

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-2 rounded-lg p-0.5 text-left transition-colors",
        isActive
          ? "bg-orange-50 ring-1 ring-orange-200"
          : "hover:bg-orange-50/70"
      )}
      role="presentation"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-auto min-w-0 flex-1 flex-col items-start justify-start gap-0 rounded-lg px-2.5 py-2 text-left font-normal no-underline hover:no-underline"
        role="option"
        aria-selected={isActive}
        onClick={handleSelect}
      >
        <div className="flex w-full items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isActive ? "text-orange-900" : "text-stone-800"
            )}
          >
            {conversation.title}
          </p>
          {isActive && (
            <span className="shrink-0 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Active
            </span>
          )}
        </div>
        <p className="mt-0.5 w-full truncate text-xs text-stone-500">
          {conversation.preview}
        </p>
        <p className="mt-1 text-[11px] text-stone-400">
          {formatConversationUpdatedAt(conversation.updatedAt)}
        </p>
      </Button>

      {canDelete && (
        <Button
          variant="secondary"
          size="xs"
          onClick={handleDelete}
          aria-label={`Delete ${conversation.title}`}
          className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
        >
          <CloseIcon className="text-xs" />
        </Button>
      )}
    </div>
  );
};

export const ConversationListItem = memo(ConversationListItemComponent);
