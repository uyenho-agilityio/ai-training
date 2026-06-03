import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { REQUEST_CONTEXT_CURRENT_CITY } from "../constants";
import { buildWeatherAgentInstructions } from "../utils";
import { weatherTool } from "../tools/weather-tool";
import { scorers } from "../scorers/weather-scorer";
import { WeatherAgentStateSchema } from "../types";
import { getDBStore } from "../utils";

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: async ({ requestContext }) => {
    const currentCity = requestContext?.get(REQUEST_CONTEXT_CURRENT_CITY) as
      | string
      | undefined;

    return buildWeatherAgentInstructions({ currentCity });
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
