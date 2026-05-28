"use client";

import { useRef } from "react";
import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";

import type { WeatherAgentState } from "../types";
import { getStatusText } from "../utils";
import { WeatherReportView } from "./WeatherCardView";
import { MASTRA_MEMORY_RESOURCE_ID } from "../constants";

export const initialState: WeatherAgentState = {
  status: "idle",
  location: null,
  processingStage: "idle",
  weatherReport: null,
};

const LocationPin = ({ location }: { location: string }) => (
  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
    Location: {location}
  </div>
);

export const WeatherInfo = () => {
  const activeLocationRef = useRef<string | null>(null);

  const { state, setState } = useCoAgent<WeatherAgentState>({
    name: MASTRA_MEMORY_RESOURCE_ID,
    initialState,
  });

  useCoAgentStateRender<WeatherAgentState>({
    name: MASTRA_MEMORY_RESOURCE_ID,
    render: ({ state: agentState, status }) => {
      if (status === "inProgress") {
        const location = agentState.location?.trim() ?? "";
        const activeLocation = activeLocationRef.current?.trim() ?? "";

        // Only show the status for the latest user-requested location
        if (
          agentState?.status === "done" ||
          (activeLocation && location && activeLocation !== location)
        ) {
          return null;
        }

        return (
          <div className="py-1">
            <p className="text-md text-gradient-muted text-left font-medium">
              {getStatusText(agentState)}
            </p>
            {location && <LocationPin location={location} />}
          </div>
        );
      }

      if (status === "complete") {
        if (activeLocationRef.current === (agentState.location?.trim() ?? "")) {
          activeLocationRef.current = null;
        }
        return null;
      }

      return null;
    },
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    activeLocationRef.current = e.target.value.trim() || null;
    setState((prev) => ({
      ...(prev ?? initialState),
      location: e.target.value,
      status: "fetching",
      processingStage: "fetching",
    }));
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="w-full">
        <label className="mb-2 block text-left text-lg font-semibold text-gradient-label">
          Location
        </label>
        <input
          disabled
          placeholder="e.g. What's the weather like in Ho Chi Minh City?"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-sky-200 transition focus:ring-2"
          value={state.location ?? ""}
          onChange={handleLocationChange}
        />
      </div>

      {state?.status === "error" && (
        <p className="text-center text-sm font-medium text-red-500">
          Unable to retrieve weather information. Please try again.
        </p>
      )}

      {state?.status === "done" && state?.weatherReport && (
        <div className="w-full text-left">
          <WeatherReportView report={state.weatherReport} />
        </div>
      )}
    </div>
  );
};
