"use client";

import { memo, useCallback, type ReactElement } from "react";
import { useChatContext } from "@copilotkit/react-ui";

import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useConversationHistory } from "@/hooks";
import { ConversationListPanel } from "./ConversationListPanel";
import { Button } from "../../commons";

const ConversationHistoryHeaderComponent = (): ReactElement => {
  const { setOpen, icons } = useChatContext();
  const {
    activeConversation,
    isListOpen,
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

  const title = activeConversation?.title ?? "AI Assistant";

  return (
    <div className="relative border-b border-orange-100 bg-white px-3 py-2.5">
      {isListOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={closeList}
        />
      )}

      <div className="relative z-50 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={isListOpen}
          aria-haspopup="listbox"
          className={cn(
            "h-auto min-w-0 flex-1 justify-between gap-2 px-3 py-2 text-left font-semibold",
            isListOpen
              ? "border-orange-300 bg-orange-50"
              : "border-orange-100 bg-orange-50/40 hover:border-orange-200 hover:bg-orange-50"
          )}
          onClick={handleToggleList}
        >
          <span className="min-w-0 flex-1 truncate text-sm text-stone-800">
            {title}
          </span>
          <ChevronDownIcon
            className={cn(
              "shrink-0 text-[10px] text-orange-500 transition-transform",
              isListOpen ? "rotate-180" : ""
            )}
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
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
  ConversationHistoryHeaderComponent
);
