import {
  AbstractAgent,
  EventType,
  randomUUID,
  type RunAgentInput,
  type BaseEvent,
} from "@ag-ui/client";
import { Observable } from "rxjs";

export class CustomAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    const { threadId, runId } = input;
    const lastUser = this.messages.filter((m) => m.role === "user").at(-1);
    const text = lastUser?.content ?? "Hi";

    return new Observable<BaseEvent>((observer) => {
      // Emit RUN_STARTED event
      observer.next({
        type: EventType.RUN_STARTED,
        threadId,
        runId,
      });

      // Send a message
      const messageId = randomUUID();

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

      // Emit RUN_FINISHED event
      observer.next({
        type: EventType.RUN_FINISHED,
        threadId,
        runId,
      });

      // Complete the observable
      observer.complete();
    });
  }
}
