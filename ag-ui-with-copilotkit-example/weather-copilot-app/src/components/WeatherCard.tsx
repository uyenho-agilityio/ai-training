"use client";

import { useCoAgentStateRender } from "@copilotkit/react-core";
import type { WeatherAgentState } from "../types";
import { WeatherReportView } from "./WeatherCardView";

export const WeatherCard = () => {
  useCoAgentStateRender<WeatherAgentState>({
    name: "weatherAgent",
    render: ({ state }) => {
      if (!state?.weatherReport) return null;
      return <WeatherReportView report={state.weatherReport} compact />;
    },
  });
  return null;
};
