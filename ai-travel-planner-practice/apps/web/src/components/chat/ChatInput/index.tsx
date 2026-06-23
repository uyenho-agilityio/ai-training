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

import type { InputProps } from "@copilotkit/react-ui";
import { useChatContext } from "@copilotkit/react-ui";

import { SendArrowIcon } from "@/icons";
import { Button } from "../../commons";
import { chatInputContainerClasses, chatInputTextareaClasses } from "../styles";

const ChatInputComponent = ({
  inProgress,
  hideStopButton = false,
  chatReady = true,
  onSend,
  onStop,
}: InputProps): ReactElement => {
  const { labels } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [isComposing, setIsComposing] = useState<boolean>(false);

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
