export type WeatherReport = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust?: number;
  conditions: string;
  location: string;
};

export type WeatherAgentState = {
  status: "idle" | "fetching" | "done" | "error";
  location: string | null;
  processingStage:
    | "idle"
    | "analyzing_request"
    | "fetching_weather"
    | "formatting_response"
    | "done"
    | "error";
  weatherReport: WeatherReport | null;
};

export type WeatherTheme =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "drizzle"
  | "thunder"
  | "snow"
  | "fog";

export type WeatherThemeConfig = {
  theme: WeatherTheme;
  label: string;
  skyFrom: string;
  skyTo: string;
  accent: string;
  hint: string;
};

export type WeatherSceneProps = {
  theme: WeatherTheme;
  accent: string;
};

export type WeatherCardField =
  | "hero"
  | "conditions"
  | "temperature"
  | "feelsLike"
  | "humidity"
  | "wind"
  | "hint";

export type WeatherCardViewProps = {
  report: WeatherReport;
  field: WeatherCardField;
  compact?: boolean;
};

export type MetricConfig = {
  label: string;
  value: string;
  gradient: string;
};

export type WeatherFetchApprovalArgs = {
  location: string;
};

export * from "./memory";
