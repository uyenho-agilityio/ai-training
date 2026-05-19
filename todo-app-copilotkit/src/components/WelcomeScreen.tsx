"use client";

import { CopilotChatView, CopilotSidebarView } from "@copilotkit/react-core/v2";

type WelcomeScreenProps = React.ComponentProps<
  typeof CopilotSidebarView.WelcomeScreen
>;

export const WelcomeScreen = ({
  input,
  suggestionView,
}: WelcomeScreenProps) => (
  <div data-testid="copilot-welcome-screen" className="flex h-full flex-col">
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <CopilotChatView.WelcomeMessage />
    </div>
    <div className="shrink-0 px-0 pb-4">
      {suggestionView && (
        <div className="mb-4 flex justify-center">{suggestionView}</div>
      )}
      {input}
    </div>
  </div>
);
