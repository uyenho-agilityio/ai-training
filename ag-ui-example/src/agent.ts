import { Agent } from "@mastra/core/agent";
import { MastraAgent } from "@ag-ui/mastra";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import { weatherTool } from "./tools/weather.tool";
import { browserTool } from "./tools/browser.tool";
import { calculatorTool } from "./tools/calculator.tool";

export const agent = new MastraAgent({
  resourceId: "cliExample",
  agent: new Agent({
    id: "ag-ui-assistant",
    name: "AG-UI Assistant",
    instructions: `
      You are a helpful assistant with weather and web browsing capabilities.

      For current weather (temperature, conditions in a city):
      - Use get-weather only. Do NOT use open-browser for this.

      For opening websites in the browser:
      - Call open-browser exactly ONCE per user message — never twice for the same request
      - Google → https://www.google.com
      - "weather website", "weather web", "show weather site" → https://www.accuweather.com/ only (not weather.com)
      - Do NOT call get-weather when the user only wants to open a website

      Calculator (tool id: calculator):
      - Math questions → pass expression (e.g. "25*4")

      Be friendly and helpful in all interactions!
    `,
    model: "openai/gpt-4o-mini",
    tools: { weatherTool, browserTool, calculatorTool },
    memory: new Memory({
      storage: new LibSQLStore({
        id: "storage-memory",
        url: "file:./assistant.db",
      }),
    }),
  }),
  threadId: "main-conversation",
});
