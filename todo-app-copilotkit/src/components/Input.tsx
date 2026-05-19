import type { CopilotChatInputProps } from "@copilotkit/react-core/v2";

import { AddMenuButton } from "./AddMenuButton";

export const Input = {
  positioning: "static",
  autoFocus: true,
  showDisclaimer: true,
  bottomAnchored: false,
  className:
    "shrink-0 border-t border-[#e8e8e8] bg-white py-3 [&>motion.div]:!px-0 [&>motion.div]:max-w-none [&_.copilotKitInput]:min-h-[3.25rem] [&_.copilotKitInput]:rounded-xl [&_.copilotKitInput]:border [&_.copilotKitInput]:border-[#e8e8e8] [&_.copilotKitInput]:bg-[#f5f5f5] [&_.copilotKitInput]:shadow-none",
  textArea:
    "max-h-24 min-h-6 resize-none border-0 bg-transparent py-0.5 text-[0.9375rem] leading-snug shadow-none outline-none",
  sendButton:
    "rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-45",
  addMenuButton: AddMenuButton,
} satisfies Partial<CopilotChatInputProps>;
