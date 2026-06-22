import type { ComponentType } from "react";

import type { TemperatureUnit, WeatherCondition } from "@/types";
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

/** Convert stored Celsius temperature to the display unit. */
export const formatTemperature = (
  celsius: number,
  unit: TemperatureUnit,
): string => {
  const value: number =
    unit === "F" ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);

  return `${value}°${unit}`;
};

/** Map weather agent condition labels to SVG icon components. */
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
