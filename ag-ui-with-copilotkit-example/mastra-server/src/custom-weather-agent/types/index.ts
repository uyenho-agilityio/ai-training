import type { WeatherAgentState } from "../../mastra/types";

export type CustomWeatherAgentConfig = {
  openaiApiKey?: string;
  currentCity?: string;
  debugTransport?: boolean;
};

export type { WeatherAgentState };
