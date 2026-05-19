"use client";

import { CopilotChatInput } from "@copilotkit/react-core/v2";

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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-5"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  </button>
)) as typeof CopilotChatInput.AddMenuButton;
