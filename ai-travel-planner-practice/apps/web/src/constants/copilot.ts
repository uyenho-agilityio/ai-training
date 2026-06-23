export const DEFAULT_COPILOT_RUNTIME_URL = "http://localhost:4111/chat";
export const DEFAULT_COPILOT_AGENT = "weatherAgent";

export const copilotRuntimeUrl =
  process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL ?? DEFAULT_COPILOT_RUNTIME_URL;
export const copilotAgent =
  process.env.NEXT_PUBLIC_COPILOT_AGENT ?? DEFAULT_COPILOT_AGENT;

export const HIDDEN_WEATHER_TOOL_NAMES = {
  weatherTool: "weatherTool",
  getWeather: "get-weather",
} as const;
