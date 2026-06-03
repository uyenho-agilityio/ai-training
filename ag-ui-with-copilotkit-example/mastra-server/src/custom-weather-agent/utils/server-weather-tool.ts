import type { Tool } from "@ag-ui/core";

import { WEATHER_TOOL_ID } from "../constants";

export const serverWeatherToolDefinition: Tool = {
  name: WEATHER_TOOL_ID,
  description: "Get current weather for a location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name",
      },
    },
    required: ["location"],
  },
};
