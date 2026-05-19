"use client";

import {
  CopilotChatUserMessage,
  type CopilotChatUserMessageProps,
} from "@copilotkit/react-core/v2";

const UserMessageBody = ({ content }: { content: string }) => (
  <div className="ml-auto flex max-w-[85%] flex-col items-end gap-1.5">
    <span className="inline-block rounded-full bg-blue-500 px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-white uppercase">
      You
    </span>
    <p className="m-0 rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-3 text-sm leading-snug whitespace-pre-wrap text-white shadow-md shadow-blue-500/25">
      {content}
    </p>
  </div>
);

export const UserMessage = ((props: CopilotChatUserMessageProps) => (
  <CopilotChatUserMessage
    {...props}
    className="pt-2"
    messageRenderer={UserMessageBody}
  />
)) as typeof CopilotChatUserMessage;
