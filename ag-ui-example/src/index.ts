import * as readline from "readline";
import { agent } from "./agent";
import { randomUUID } from "@ag-ui/client";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatLoop = async () => {
  console.log("🤖 AG-UI Assistant started!");
  console.log("Type your messages and press Enter. Press Ctrl+D to quit.\n");

  return new Promise<void>((resolve) => {
    const promptUser = () => {
      rl.question("> ", async (input: string) => {
        if (input.trim() === "") {
          promptUser();
          return;
        }
        console.log("");

        // Pause input while processing
        rl.pause();

        // Add user message to conversation
        agent.messages.push({
          id: randomUUID(),
          role: "user",
          content: input.trim(),
        });

        try {
          // Run the agent with event handlers
          await agent.runAgent(
            {}, // No additional configuration needed
            {
              onRunStartedEvent() {
                console.log("[EVENT] RUN_STARTED");
              },
              onRunFinishedEvent() {
                console.log("[EVENT] RUN_FINISHED");
              },

              // TOOL_CALL_START
              onToolCallStartEvent({ event }) {
                console.log("🔧 Tool call:", event.toolCallName);
              },
              // TOOL_CALL_ARGS
              onToolCallArgsEvent({ event }) {
                process.stdout.write(event.delta);
              },
              // TOOL_CALL_END
              onToolCallEndEvent() {
                console.log("");
              },
              // TOOL_CALL_RESULT
              onToolCallResultEvent({ event }) {
                if (event.content) {
                  console.log("🔍 Tool call result:", event.content);
                }
              },

              // TEXT_MESSAGE_START + CONTENT + END
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
        }

        // Resume input
        rl.resume();
        promptUser();
      });
    };

    // Handle Ctrl+D to quit
    rl.on("close", () => {
      console.log("\n👋 Thanks for using AG-UI Assistant!");
      resolve();
    });

    promptUser();
  });
};

async function main() {
  await chatLoop();
}

main().catch(console.error);
