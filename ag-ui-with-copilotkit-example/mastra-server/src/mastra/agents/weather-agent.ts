import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { REQUEST_CONTEXT_CURRENT_CITY } from "../constants";
import { weatherTool } from "../tools/weather-tool";
import { scorers } from "../scorers/weather-scorer";
import { WeatherAgentStateSchema } from "../types";
import { getDBStore } from "../utils";

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: async ({ requestContext }) => {
    // Should ask "Recommend something to do for today?"" to test the currentCity context is working in the agent instructions
    const currentCity = requestContext?.get(REQUEST_CONTEXT_CURRENT_CITY);

    const locationRuleOverride = currentCity
      ? `- The user is currently in: "${currentCity}". If they ask general questions about the weather or activities without specifying a place, AUTOMATICALLY assume this location. BYPASS the rule to ask for location.`
      : "- Always ask for a location if none is provided";

    return `You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

Your primary function is to help users get weather details for specific locations. When responding:
${locationRuleOverride}
- If the location name isn't in English, please translate it
- If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
- Include relevant details like humidity, wind conditions, and precipitation
- Keep responses concise but informative
- If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
- If the user asks for activities, respond in the format they request.

Human-in-the-loop (required before any weather API call):
- When the user asks for current weather for a location, you MUST call the frontend action approveWeatherFetch with that location first.
- If the user approves (response "approved"), then call weatherTool and stream the weather answer.
- If the user rejects (response "rejected"), do NOT call weatherTool. Tell the user the fetch was cancelled and ask if they want to try another city.
- Never call weatherTool without a prior approved approveWeatherFetch for the same location in this turn.

Keep working memory in sync with the weather workflow:
- Before fetching weather: set status to "fetching", location, and processingStage.
- After a successful weatherTool call: set weatherReport from the tool result and status to "done".
- On errors: set status to "error".`;
  },
  model: "openai/gpt-5-mini",
  tools: { weatherTool },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
    translation: {
      scorer: scorers.translationScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: getDBStore("weather-agent-memory"),
    options: {
      workingMemory: {
        enabled: true,
        schema: WeatherAgentStateSchema,
      },
    },
  }),
});
