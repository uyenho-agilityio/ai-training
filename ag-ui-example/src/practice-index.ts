import * as readline from "readline";
import { randomUUID } from "@ag-ui/client";

// import { CustomAgent } from "./custom-agent";
import { CustomWeatherAgent } from "./custom-weather-agent";

const agent = new CustomWeatherAgent({
  threadId: "practice-conversation",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatLoop = async () => {
  console.log("🤖 Custom AG-UI Agent (practice)");
  console.log("Type a message and press Enter. Ctrl+D to quit.\n");

  return new Promise<void>((resolve) => {
    const promptUser = () => {
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
                if (event.content)
                  console.log("🔍 Tool call result:", event.content);
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
        }

        rl.resume();
        promptUser();
      });
    };

    rl.on("close", () => {
      console.log("\n👋 Done.");
      resolve();
    });

    promptUser();
  });
};

chatLoop().catch(console.error);
