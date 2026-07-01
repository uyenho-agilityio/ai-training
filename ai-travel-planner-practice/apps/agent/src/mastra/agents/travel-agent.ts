import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { chatModel } from "../config";
import { scorers } from "../scorers";
import {
  searchFlightsTool,
  searchHotelsTool,
  searchTripBookingsTool,
  weatherTool,
  checkPlacesTool,
  tripSketchTool,
} from "../tools";
import { buildTravelAgentInstructions } from "./travel-agent-instructions";

export const travelAgent = new Agent({
  id: "travel-agent",
  name: "Travel Planner Agent",
  instructions: () => buildTravelAgentInstructions(),
  model: chatModel,
  defaultOptions: {
    maxSteps: 8,
  },
  tools: {
    weatherTool,
    searchTripBookingsTool,
    searchFlightsTool,
    searchHotelsTool,
    checkPlacesTool,
    tripSketchTool,
  },
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
    options: {
      workingMemory: {
        enabled: true,
      },
    },
  }),
});
