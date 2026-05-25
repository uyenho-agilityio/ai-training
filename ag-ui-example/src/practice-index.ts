import * as readline from "readline";
import { randomUUID } from "@ag-ui/client";

// import { CustomAgent } from "./custom-agent";
import { CustomWeatherAgent } from "./custom-weather-agent";
import { initialWeatherAgentState } from "./schema";

const agent = new CustomWeatherAgent({
  threadId: "practice-conversation",
  initialState: initialWeatherAgentState,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatLoop = async () => {
  console.log("🤖 Custom AG-UI Agent (practice)");
  console.log("Type a message and press Enter. Ctrl+D to quit.\n");

  return new Promise<void>((resolve) => {
    let isClosing = false;

    const promptUser = () => {
      if (isClosing) return;

      rl.question("> ", async (input: string) => {
        if (input.trim() === "") {
          promptUser();
          return;
        }
        console.log("");
        rl.pause();

        agent.messages.push({
          id: randomUUID(),
          role: "user",
          content: input.trim(),
        });

        try {
          await agent.runAgent(
            {},
            {
              onRunStartedEvent() {
                console.log("[EVENT] RUN_STARTED");
              },
              onRunFinishedEvent() {
                console.log("[EVENT] RUN_FINISHED");
              },
              onRunErrorEvent({ event }) {
                console.log("[EVENT] RUN_ERROR:", event.message);
              },
              onStateSnapshotEvent({ event }) {
                console.log(
                  "[STATE SNAPSHOT]",
                  JSON.stringify(event.snapshot, null, 2)
                );
              },
              onStateDeltaEvent({ event }) {
                console.log("[STATE DELTA]", event.delta);
              },
              onStateChanged() {
                console.log("[STATE NOW]", agent.state);
              },
              onToolCallStartEvent({ event }) {
                console.log("🔧 Tool call:", event.toolCallName);
              },
              onToolCallArgsEvent({ event }) {
                process.stdout.write(event.delta);
              },
              onToolCallEndEvent() {
                console.log("");
              },
              onToolCallResultEvent({ event }) {
                if (event.content) {
                  console.log("🔍 Tool call result:", event.content);
                }
              },
              onTextMessageStartEvent() {
                process.stdout.write("🤖 Assistant: ");
              },
              onTextMessageContentEvent({ event }) {
                process.stdout.write(event.delta);
              },
              onTextMessageEndEvent() {
                console.log("\n");
              },
            }
          );
        } catch (error) {
          console.error("❌ Error:", error);
        } finally {
          if (!isClosing) {
            rl.resume();
            promptUser();
          }
        }
      });
    };

    rl.on("close", () => {
      isClosing = true;
      console.log("\n👋 Done.");
      resolve();
    });

    promptUser();
  });
};

chatLoop().catch(console.error);
