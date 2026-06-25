import type { ComponentType } from "react";

import type { TemperatureUnit, WeatherCondition } from "@/types";
import type {
  WeatherData,
  WeatherDetailItem,
  WeatherToolResult,
} from "@/types";
import {
  CloudIcon,
  CloudSunIcon,
  DrizzleIcon,
  FogIcon,
  RainIcon,
  SnowIcon,
  SunIcon,
  ThunderstormIcon,
  type IconProps,
} from "@/icons";

export const formatTemperature = (
  celsius: number,
  unit: TemperatureUnit,
): string => {
  const value: number = unit === "F" ? (celsius * 9) / 5 + 32 : celsius;

  return `${value.toFixed(1)}°${unit}`;
};

export const isWeatherToolResult = (
  value: unknown,
): value is WeatherToolResult => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.temperature === "number" &&
    typeof record.location === "string" &&
    typeof record.conditions === "string"
  );
};

export const mapWeatherToolResult = (
  result: WeatherToolResult,
): WeatherData => ({
  temp: result.temperature,
  feelsLike: result.feelsLike,
  humidity: result.humidity,
  windSpeed: result.windSpeed,
  windGust: result.windGust,
  condition: result.conditions as WeatherData["condition"],
  location: result.location,
});

export const formatHumidity = (humidity: number): string => `${humidity}%`;

export const formatWindSpeed = (speedKmh: number): string =>
  `${speedKmh.toFixed(1)} km/h`;

export const getWeatherIcon = (
  condition: WeatherCondition,
): ComponentType<IconProps> => {
  switch (condition) {
    case "Clear sky":
    case "Mainly clear":
      return SunIcon;
    case "Partly cloudy":
      return CloudSunIcon;
    case "Overcast":
      return CloudIcon;
    case "Foggy":
    case "Depositing rime fog":
      return FogIcon;
    case "Light drizzle":
    case "Moderate drizzle":
    case "Dense drizzle":
    case "Light freezing drizzle":
    case "Dense freezing drizzle":
      return DrizzleIcon;
    case "Slight rain":
    case "Moderate rain":
    case "Light freezing rain":
    case "Slight rain showers":
    case "Moderate rain showers":
    case "Heavy rain":
    case "Heavy freezing rain":
    case "Violent rain showers":
      return RainIcon;
    case "Slight snow fall":
    case "Moderate snow fall":
    case "Heavy snow fall":
    case "Snow grains":
    case "Slight snow showers":
    case "Heavy snow showers":
      return SnowIcon;
    case "Thunderstorm":
    case "Thunderstorm with slight hail":
    case "Thunderstorm with heavy hail":
      return ThunderstormIcon;
    case "Unknown":
    default:
      return CloudSunIcon;
  }
};

export const getWeatherDetailItems = (
  weather: WeatherData,
  unit: TemperatureUnit,
): WeatherDetailItem[] => [
  {
    id: "feels-like",
    label: "Feels like",
    value: formatTemperature(weather.feelsLike, unit),
  },
  {
    id: "humidity",
    label: "Humidity",
    value: formatHumidity(weather.humidity),
  },
  {
    id: "wind",
    label: "Wind",
    value: formatWindSpeed(weather.windSpeed),
  },
  {
    id: "gust",
    label: "Gust",
    value: formatWindSpeed(weather.windGust),
  },
];
