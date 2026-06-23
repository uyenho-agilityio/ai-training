"use client";

import { memo } from "react";

import { useRenderToolCall } from "@copilotkit/react-core";

import { HIDDEN_WEATHER_TOOL_NAMES } from "@/constants";

const emptyToolRender = (): null => null;

const HideWeatherToolComponent = (): null => {
  useRenderToolCall({
    name: HIDDEN_WEATHER_TOOL_NAMES.weatherTool,
    parameters: [],
    render: emptyToolRender as never,
  });

  useRenderToolCall({
    name: HIDDEN_WEATHER_TOOL_NAMES.getWeather,
    parameters: [],
    render: emptyToolRender as never,
  });

  return null;
};

export const HideWeatherTool = memo(HideWeatherToolComponent);
