import { z } from "zod";

export const WeatherAgentStateSchema = z.object({
  status: z.enum(["idle", "fetching", "done", "error"]).default("idle"),
  location: z.string().nullable().default(null),
  processingStage: z
    .enum([
      "idle",
      "analyzing_request",
      "fetching_weather",
      "formatting_response",
      "done",
      "error",
    ])
    .default("idle"),
  weatherReport: z
    .object({
      temperature: z.number(),
      feelsLike: z.number(),
      humidity: z.number(),
      windSpeed: z.number(),
      windGust: z.number().optional(),
      conditions: z.string(),
      location: z.string(),
    })
    .nullable()
    .default(null),
});

export type WeatherAgentState = z.infer<typeof WeatherAgentStateSchema>;
