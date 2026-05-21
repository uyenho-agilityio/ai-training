"use client";

import { CopilotChatInput } from "@copilotkit/react-core/v2";

import { PlusIcon } from "@/icons";

export const AddMenuButton = (({
  // toolsMenu: _toolsMenu,
  className,
  disabled,
  onAddFile,
}: React.ComponentProps<typeof CopilotChatInput.AddMenuButton>) => (
  <button
    type="button"
    aria-label="Attach file"
    title="Attach file"
    className={`ml-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#555] hover:bg-gray-200 hover:text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-35${className ? ` ${className}` : ""}`}
    disabled={disabled || !onAddFile}
    onClick={onAddFile}
  >
    <PlusIcon />
  </button>
)) as typeof CopilotChatInput.AddMenuButton;
