import { EventType, type BaseEvent } from "@ag-ui/core";

/** Proto encoder requires numeric fields; chunk event types are not in @ag-ui/proto enum. */
export const withAgUiEvent = <T extends BaseEvent>(event: T): T => ({
  ...event,
  timestamp: event.timestamp ?? Date.now(),
});

export const createTextStreamEmitter = (
  emit: (event: BaseEvent) => void,
  messageId: string
) => {
  let started = false;

  return {
    writeDelta: (delta: string) => {
      if (!started) {
        emit(
          withAgUiEvent({
            type: EventType.TEXT_MESSAGE_START,
            messageId,
            role: "assistant",
          })
        );
        started = true;
      }

      emit(
        withAgUiEvent({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta,
        })
      );
    },
    end: () => {
      if (!started) return;

      emit(
        withAgUiEvent({
          type: EventType.TEXT_MESSAGE_END,
          messageId,
        })
      );
    },
  };
};

export const createToolCallStreamEmitter = (
  emit: (event: BaseEvent) => void,
  parentMessageId: string
) => {
  const started = new Set<number>();

  return {
    writeDelta: (
      index: number,
      toolCallId: string,
      toolCallName: string,
      argsDelta?: string
    ) => {
      if (!started.has(index) && toolCallId && toolCallName) {
        emit(
          withAgUiEvent({
            type: EventType.TOOL_CALL_START,
            toolCallId,
            toolCallName,
            parentMessageId,
          })
        );
        started.add(index);
      }

      if (argsDelta) {
        emit(
          withAgUiEvent({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId,
            delta: argsDelta,
          })
        );
      }
    },
    end: (toolCallId: string) => {
      emit(
        withAgUiEvent({
          type: EventType.TOOL_CALL_END,
          toolCallId,
        })
      );
    },
  };
};
