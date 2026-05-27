import { METRIC_GRADIENTS } from "../constants";
import type {
  MetricConfig,
  WeatherAgentState,
  WeatherCardField,
  WeatherReport,
  WeatherTheme,
  WeatherThemeConfig,
} from "../types";

const formatTemp = (value: number) => `${value.toFixed(1)}°C`;

export const getMetricConfig = (
  report: WeatherReport,
  field: WeatherCardField,
  hint: string
): MetricConfig | null => {
  switch (field) {
    case "temperature":
      return {
        label: "Temperature",
        value: formatTemp(report.temperature),
        gradient: METRIC_GRADIENTS.temperature,
      };
    case "feelsLike":
      return {
        label: "Feels like",
        value: formatTemp(report.feelsLike),
        gradient: METRIC_GRADIENTS.feelsLike,
      };
    case "humidity":
      return {
        label: "Humidity",
        value: `${Math.round(report.humidity)}%`,
        gradient: METRIC_GRADIENTS.humidity,
      };
    case "wind": {
      const gustText =
        report.windGust != null
          ? ` · gusts ~${report.windGust.toFixed(0)} km/h`
          : "";
      return {
        label: "Wind",
        value: `${report.windSpeed.toFixed(0)} km/h${gustText}`,
        gradient: METRIC_GRADIENTS.wind,
      };
    }
    case "conditions":
      return {
        label: "Conditions",
        value: report.conditions,
        gradient: METRIC_GRADIENTS.conditions,
      };
    case "hint":
      return {
        label: "Tip",
        value: hint,
        gradient: METRIC_GRADIENTS.hint,
      };
    default:
      return null;
  }
};

export const getStatusText = (state: WeatherAgentState) => {
  switch (state?.processingStage) {
    case "idle":
      return "";
    case "analyzing_request":
      return "Analyzing your request...";
    case "fetching_weather":
      return "Fetching current weather data...";
    case "formatting_response":
      return "Formatting weather information...";
    case "done":
      return "Weather information ready";
    case "error":
      return "Error occurred while getting weather";
    default:
      return "";
  }
};

const THEME_HINTS: Record<WeatherTheme, string> = {
  clear:
    "Clear skies — light layers and sunscreen if you are outside for a while.",
  "partly-cloudy": "Mostly fine — a light jacket may be enough.",
  cloudy: "Overcast — comfortable for walking; no strong sun.",
  rain: "Rainy and humid — bring an umbrella and expect it to feel warmer than the thermometer.",
  drizzle: "Light drizzle — waterproof layer or umbrella recommended.",
  thunder: "Stormy — stay indoors if possible and avoid open areas.",
  snow: "Cold with snow — dress warmly and watch for slippery surfaces.",
  fog: "Low visibility — take extra care when driving or commuting.",
};

const resolveTheme = (conditions: string): WeatherTheme => {
  const text = conditions.toLowerCase();

  if (/thunder|hail|storm/.test(text)) return "thunder";
  if (/snow|sleet|blizzard|ice|freezing/.test(text)) return "snow";
  if (/fog|mist|haze|rime/.test(text)) return "fog";
  if (/drizzle/.test(text)) return "drizzle";
  if (/rain|shower|precipitation|wet/.test(text)) return "rain";
  if (/overcast/.test(text)) return "cloudy";
  if (/partly|mainly clear/.test(text)) return "partly-cloudy";
  if (/cloud/.test(text)) return "cloudy";
  if (/clear|sunny|fair/.test(text)) return "clear";

  return "partly-cloudy";
};

export const getWeatherTheme = (conditions: string): WeatherThemeConfig => {
  const theme = resolveTheme(conditions);

  const configs: Record<
    WeatherTheme,
    Omit<WeatherThemeConfig, "theme" | "hint">
  > = {
    clear: {
      label: "Sunny",
      skyFrom: "#38bdf8",
      skyTo: "#0ea5e9",
      accent: "#fbbf24",
    },
    "partly-cloudy": {
      label: "Partly cloudy",
      skyFrom: "#7dd3fc",
      skyTo: "#38bdf8",
      accent: "#fde68a",
    },
    cloudy: {
      label: "Cloudy",
      skyFrom: "#94a3b8",
      skyTo: "#64748b",
      accent: "#cbd5e1",
    },
    rain: {
      label: "Rainy",
      skyFrom: "#64748b",
      skyTo: "#334155",
      accent: "#60a5fa",
    },
    drizzle: {
      label: "Drizzle",
      skyFrom: "#94a3b8",
      skyTo: "#475569",
      accent: "#7dd3fc",
    },
    thunder: {
      label: "Thunderstorm",
      skyFrom: "#475569",
      skyTo: "#1e293b",
      accent: "#a78bfa",
    },
    snow: {
      label: "Snow",
      skyFrom: "#e2e8f0",
      skyTo: "#94a3b8",
      accent: "#f8fafc",
    },
    fog: {
      label: "Foggy",
      skyFrom: "#cbd5e1",
      skyTo: "#94a3b8",
      accent: "#e2e8f0",
    },
  };

  const base = configs[theme];

  return {
    theme,
    hint: THEME_HINTS[theme],
    ...base,
  };
};
