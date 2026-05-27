"use client";

import { useCoAgentStateRender } from "@copilotkit/react-core";
import type { WeatherAgentState } from "../types";
import { WeatherReportView } from "./WeatherCardView";
import { getStatusText } from "@/src/utils";

export const WeatherCard = () => {
  useCoAgentStateRender<WeatherAgentState>({
    name: "weatherAgent",
    render: ({ state }) => {
      return state?.weatherReport ? (
        <WeatherReportView report={state.weatherReport} compact />
      ) : (
        <p className="text-md font-medium text-gradient-muted text-left">
          {getStatusText(state)}
        </p>
      );
    },
  });
  return null;
};
