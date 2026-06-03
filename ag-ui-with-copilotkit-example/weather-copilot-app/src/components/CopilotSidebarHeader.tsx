"use client";

import { CopilotDevConsole, useChatContext } from "@copilotkit/react-ui";

import { useChatThread } from "../hooks";

export const CopilotSidebarHeader = () => {
  const { setOpen, icons, labels } = useChatContext();
  const { startNewThread } = useChatThread();

  return (
    <div className="copilotKitHeader">
      <div>{labels.title}</div>
      <div className="copilotKitHeaderControls">
        <button
          type="button"
          className="rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          onClick={startNewThread}
        >
          New chat
        </button>
        {process.env.NODE_ENV === "development" && <CopilotDevConsole />}
        <button
          type="button"
          aria-label="Close"
          className="copilotKitHeaderCloseButton"
          onClick={() => setOpen(false)}
        >
          {icons.headerCloseIcon}
        </button>
      </div>
    </div>
  );
};
