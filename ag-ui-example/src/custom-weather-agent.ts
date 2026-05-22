import {
  AbstractAgent,
  EventType,
  randomUUID,
  type RunAgentInput,
  type BaseEvent,
} from "@ag-ui/client";
import { Observable } from "rxjs";

import { getWeather } from "./tools/weather.tool";

const parseLocation = (userText: string): string | null => {
  const text = userText.trim();
  if (!/weather/i.test(text)) return null;

  // Extract location after "weather in " or "weather "
  const match = text.match(/weather\s+(?:in\s+)?(.+)/i);
  const rawLocation = match ? match[1].trim() : text;

  // Normalize Nha Trang city alias, otherwise return the extracted location
  return /nt/i.test(rawLocation) ? "Nha Trang" : rawLocation;
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
            const argsJson = JSON.stringify({ location });

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

            const data = await getWeather(location);

            // Tool call result
            observer.next({
              type: EventType.TOOL_CALL_RESULT,
              toolCallId,
              content: JSON.stringify(data),
            });

            reply = `The weather in ${data.location} is ${data.conditions} with a temperature of ${data.temperature} degrees Celsius.`;
          } else {
            reply = "Try: weather in NT";
          }

          // Send a message
          const messageId = randomUUID();

          // Message start
          observer.next({
            type: EventType.TEXT_MESSAGE_START,
            messageId,
            role: "assistant",
          });

          // Message content
          for (const char of reply) {
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

          // Emit RUN_FINISHED event
          observer.next({
            type: EventType.RUN_FINISHED,
            threadId,
            runId,
          });

          // Complete the observable
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}
