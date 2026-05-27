export { COPILOT_OBSERVABILITY_HOOKS } from "./copilot-observability";

export const METRIC_GRADIENTS = {
  temperature: "from-sky-500 via-blue-600 to-indigo-600",
  feelsLike: "from-orange-400 via-amber-500 to-rose-500",
  humidity: "from-cyan-500 via-teal-500 to-emerald-600",
  wind: "from-violet-500 via-purple-500 to-fuchsia-600",
  conditions: "from-slate-700 via-slate-800 to-slate-900",
  hint: "from-blue-600 via-indigo-600 to-violet-600",
} as const;

export const MASTRA_CHAT_URL =
  process.env.NEXT_PUBLIC_MASTRA_CHAT_URL ?? "http://localhost:4111/chat";

export const MASTRA_API_BASE_URL =
  process.env.NEXT_PUBLIC_MASTRA_API_URL ?? "http://localhost:4111/api";

export const MASTRA_AGENT_ID = "weather-agent";

export const MASTRA_MEMORY_RESOURCE_ID = "weatherAgent";

export const COPILOT_CHAT_INITIAL =
  "Hi! 👋 Ask me about the weather, forecasts, and climate.";
