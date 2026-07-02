"use client";

import {
  ChangeEvent,
  memo,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import { useCoAgent } from "@copilotkit/react-core";
import type { InputProps } from "@copilotkit/react-ui";
import { useChatContext } from "@copilotkit/react-ui";

import { copilotAgent, PLANNING_IN_PROGRESS_MESSAGE } from "@/constants";
import { SendArrowIcon } from "@/icons";
import { Button, Text } from "../../commons";
import { TypingIndicator } from "../TypingIndicator";
import { chatInputContainerClasses, chatInputTextareaClasses } from "../styles";

const ChatInputComponent = ({
  inProgress,
  hideStopButton = false,
  chatReady = true,
  onSend,
  onStop,
}: InputProps): ReactElement => {
  const { labels } = useChatContext();
  const { running: isAgentRunning } = useCoAgent({ name: copilotAgent });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const showAgentWorking: boolean = isAgentRunning && !inProgress;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (inProgress && !hideStopButton) {
      onStop?.();
      return;
    }

    if (!chatReady || inProgress || !text.trim()) {
      return;
    }

    onSend(text);
    setText("");
    textareaRef.current?.focus();
  }, [chatReady, hideStopButton, inProgress, onSend, onStop, text]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey || isComposing) {
        return;
      }

      event.preventDefault();
      handleSend();
    },
    [handleSend, isComposing],
  );

  const isStopping = inProgress && !hideStopButton;

  return (
    <div className="px-4 pb-3 pt-2">
      {showAgentWorking && (
        <div className="mb-2">
          <TypingIndicator />
          <Text
            size="xs"
            color="muted"
            className="mt-1 px-1 text-xs font-medium text-amber-900"
          >
            {PLANNING_IN_PROGRESS_MESSAGE}
          </Text>
        </div>
      )}

      <div className={chatInputContainerClasses}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={labels.placeholder}
          value={text}
          disabled={!chatReady}
          className={chatInputTextareaClasses}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <Button
          variant="soft"
          size="xs"
          className="h-8 w-8 shrink-0 self-center p-0"
          aria-label={isStopping ? "Stop" : "Send message"}
          disabled={
            isStopping ? false : !chatReady || inProgress || !text.trim()
          }
          onClick={handleSend}
        >
          {isStopping ? (
            <span className="block h-2.5 w-2.5 rounded-sm bg-slate-700" />
          ) : (
            <SendArrowIcon className="text-orange-600" />
          )}
        </Button>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
