"use client";

import { CopilotChatMessageView } from "@copilotkit/react-core/v2";

const dotClass =
  "size-1.5 rounded-full bg-amber-600 animate-bounce [animation-duration:1.2s]";

export const TypingIndicator = (({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="status"
    aria-label="Assistant is typing"
    className={`my-2 flex w-fit items-center gap-1.5 rounded-xl border-2 border-dashed border-yellow-500 bg-yellow-50 px-3 py-2${className ? ` ${className}` : ""}`}
    {...props}
  >
    <span className="text-[0.6875rem] font-bold text-yellow-700 uppercase">
      Todo AI
    </span>
    <span className="mr-1 text-[0.8125rem] text-yellow-800">is thinking</span>
    <span className={`${dotClass} [animation-delay:0ms]`} />
    <span className={`${dotClass} [animation-delay:150ms]`} />
    <span className={`${dotClass} [animation-delay:300ms]`} />
  </div>
)) as typeof CopilotChatMessageView.Cursor;
