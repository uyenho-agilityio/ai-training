"use client";

import { useCoAgent } from "@copilotkit/react-core";
import type { WeatherAgentState } from "../types";
import { getStatusText } from "../utils";
import { WeatherReportView } from "./WeatherCardView";

const initialState: WeatherAgentState = {
  status: "idle",
  location: null,
  processingStage: "idle",
  weatherReport: null,
};

export const WeatherInfo = () => {
  const { state, setState } = useCoAgent<WeatherAgentState>({
    name: "weatherAgent",
    initialState,
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...(prev ?? initialState),
      location: e.target.value,
      processingStage: "analyzing_request",
    }));
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="w-full">
        <label className="mb-2 block text-left text-lg font-semibold text-gradient-label">
          Location
        </label>
        <input
          placeholder="e.g. Ho Chi Minh City"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-sky-200 transition focus:ring-2"
          value={state.location ?? ""}
          onChange={handleLocationChange}
        />
      </div>

      {(state.status === "fetching" || state.processingStage !== "idle") && (
        <p className="text-sm font-medium text-gradient-muted text-center">
          {getStatusText(state)}
        </p>
      )}

      {state.weatherReport && (
        <div className="w-full text-left">
          <WeatherReportView report={state.weatherReport} />
        </div>
      )}
    </div>
  );
};
