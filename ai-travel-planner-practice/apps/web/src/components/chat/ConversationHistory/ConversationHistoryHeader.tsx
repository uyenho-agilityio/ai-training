"use client";

import { memo, useCallback, useMemo, type ReactElement } from "react";
import { useChatContext } from "@copilotkit/react-ui";

import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { DEFAULT_CONVERSATION_TITLE } from "@/constants/history";
import { useConversationHistory } from "@/hooks";
import { ConversationListPanel } from "./ConversationListPanel";
import { Button, LoadingIndicator } from "../../commons";

/** Replaces the default CopilotKit sidebar header with conversation picker controls. */
const ConversationHistoryHeaderComponent = (): ReactElement => {
  const { setOpen, icons } = useChatContext();
  const {
    activeConversation,
    isListOpen,
    isSwitching,
    toggleList,
    closeList,
    createConversation,
  } = useConversationHistory();

  const handleCloseSidebar = useCallback((): void => {
    setOpen(false);
  }, [setOpen]);

  const handleToggleList = useCallback((): void => {
    toggleList();
  }, [toggleList]);

  const handleCreateConversation = useCallback((): void => {
    createConversation();
  }, [createConversation]);

  const title = useMemo((): string => {
    if (!activeConversation) {
      return DEFAULT_CONVERSATION_TITLE;
    }

    if (activeConversation.isNewTrip) {
      return DEFAULT_CONVERSATION_TITLE;
    }

    return activeConversation.title;
  }, [activeConversation]);

  const isBusy = isSwitching;

  return (
    <div className="relative border-b border-orange-100 bg-white px-3 py-2.5">
      {isListOpen ? (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={closeList}
        />
      ) : null}

      <div className="relative z-50 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          aria-expanded={isListOpen}
          aria-haspopup="listbox"
          className={cn(
            "h-auto min-w-0 flex-1 justify-between gap-2 px-3 py-2 text-left font-semibold",
            isListOpen
              ? "border-orange-300 bg-orange-50"
              : "border-orange-100 bg-orange-50/40 hover:border-orange-200 hover:bg-orange-50",
          )}
          onClick={handleToggleList}
        >
          <span className="min-w-0 flex-1 truncate text-sm text-stone-800">
            {isBusy ? (
              <LoadingIndicator
                size="xs"
                layout="inline"
                aria-label="Loading"
              />
            ) : (
              title
            )}
          </span>
          <ChevronDownIcon
            className={cn(
              "shrink-0 text-[10px] text-orange-500 transition-transform",
              isListOpen ? "rotate-180" : "",
            )}
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          className="shrink-0 whitespace-nowrap border-orange-200 text-orange-700 hover:bg-orange-50"
          onClick={handleCreateConversation}
        >
          + New
        </Button>

        <Button
          variant="secondary"
          size="xs"
          aria-label="Close chat sidebar"
          className="copilotKitHeaderCloseButton shrink-0 p-1.5 text-stone-500 hover:bg-orange-50 hover:text-stone-700"
          onClick={handleCloseSidebar}
        >
          {icons.headerCloseIcon}
        </Button>
      </div>

      <ConversationListPanel isOpen={isListOpen} onClose={closeList} />
    </div>
  );
};

export const ConversationHistoryHeader = memo(
  ConversationHistoryHeaderComponent,
);
