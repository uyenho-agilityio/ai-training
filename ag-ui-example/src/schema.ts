export type WeatherAgentState = {
  phase: "idle" | "parsing" | "fetching" | "done" | "error";
  location: string | null;
  weather: {
    temperature: number;
    conditions: string;
    location: string;
  } | null;
  error: string | null;
};

export const initialWeatherAgentState: WeatherAgentState = {
  phase: "idle",
  location: null,
  weather: null,
  error: null,
};
