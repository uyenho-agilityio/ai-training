import {
  AbstractAgent,
  EventType,
  randomUUID,
  type RunAgentInput,
  type BaseEvent,
} from "@ag-ui/client";
import { Observable } from "rxjs";

import { getWeather } from "./tools/weather.tool";
import { initialWeatherAgentState, type WeatherAgentState } from "./schema";

const parseLocation = (userText: string): string | null => {
  const text = userText.trim();
  if (!/weather/i.test(text)) return null;

  // Extract location after "weather in " or "weather "
  const match = text.match(/weather\s+(?:in\s+)?(.+)/i);
  const rawLocation = match ? match[1].trim() : text;

  // Normalize Nha Trang city alias, otherwise return the extracted location
  return /nt/i.test(rawLocation) ? "Nha Trang" : rawLocation;
};

const emitTextMessage = (
  observer: { next: (event: BaseEvent) => void },
  messageId: string,
  text: string
) => {
  // Message start
  observer.next({
    type: EventType.TEXT_MESSAGE_START,
    messageId,
    role: "assistant",
  });

  // Message content
  for (const char of text) {
    observer.next({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId,
      delta: char,
    });
  }

  // Message end
  observer.next({
    type: EventType.TEXT_MESSAGE_END,
    messageId,
  });
};

export class CustomWeatherAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    const { threadId, runId } = input;
    const lastUser = this.messages.filter((m) => m.role === "user").at(-1);
    const text = typeof lastUser?.content === "string" ? lastUser.content : "";

    return new Observable<BaseEvent>((observer) => {
      (async () => {
        try {
          // Emit RUN_STARTED event
          observer.next({
            type: EventType.RUN_STARTED,
            threadId,
            runId,
          });

          // Tool call
          const location = parseLocation(text);
          let reply: string;

          if (location) {
            const toolCallId = randomUUID();
            const toolResultMessageId = randomUUID();
            const argsJson = JSON.stringify({ location });

            // State snapshot
            observer.next({
              type: EventType.STATE_SNAPSHOT,
              snapshot: {
                phase: "parsing",
                location,
                weather: null,
                error: null,
              } satisfies WeatherAgentState,
            });

            // Tool call start
            observer.next({
              type: EventType.TOOL_CALL_START,
              toolCallId,
              toolCallName: "get-weather",
            });

            // Tool call args
            observer.next({
              type: EventType.TOOL_CALL_ARGS,
              toolCallId,
              delta: argsJson,
            });

            // Tool call end
            observer.next({
              type: EventType.TOOL_CALL_END,
              toolCallId,
            });

            // State delta
            observer.next({
              type: EventType.STATE_DELTA,
              delta: [
                { op: "replace", path: "/phase", value: "fetching" },
                { op: "replace", path: "/location", value: location },
                { op: "replace", path: "/error", value: null },
              ],
            });

            const data = await getWeather(location);

            // State delta
            observer.next({
              type: EventType.STATE_DELTA,
              delta: [
                { op: "replace", path: "/phase", value: "done" },
                { op: "replace", path: "/weather", value: data },
                { op: "replace", path: "/error", value: null },
              ],
            });

            // Tool call result
            observer.next({
              type: EventType.TOOL_CALL_RESULT,
              messageId: toolResultMessageId,
              toolCallId,
              content: JSON.stringify(data),
              role: "tool",
            });

            reply = `The weather in ${data.location} is ${data.conditions} with a temperature of ${data.temperature} degrees Celsius.`;
          } else {
            // State snapshot
            observer.next({
              type: EventType.STATE_SNAPSHOT,
              snapshot: { ...initialWeatherAgentState },
            });

            reply = "Try: weather in NT";
          }

          // Send a message
          emitTextMessage(observer, randomUUID(), reply);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          // State delta
          observer.next({
            type: EventType.STATE_DELTA,
            delta: [
              { op: "replace", path: "/phase", value: "error" },
              { op: "replace", path: "/error", value: message },
            ],
          });

          // Send a message
          emitTextMessage(
            observer,
            randomUUID(),
            `Sorry, something went wrong: ${message}`
          );

          // Emit RUN_ERROR event
          observer.next({
            type: EventType.RUN_ERROR,
            message,
          });
        }

        // Emit RUN_FINISHED event
        observer.next({
          type: EventType.RUN_FINISHED,
          threadId,
          runId,
        });

        // Complete the observable
        observer.complete();
      })();
    });
  }
}
