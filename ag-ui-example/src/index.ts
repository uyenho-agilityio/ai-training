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
              onTextMessageStartEvent() {
                process.stdout.write("🤖 Assistant: ");
              },
              onTextMessageContentEvent({ event }) {
                process.stdout.write(event.delta);
              },
              onTextMessageEndEvent() {
                console.log("\n");
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
