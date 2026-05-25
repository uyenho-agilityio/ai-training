"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import type { WeatherFetchApprovalArgs } from "../types";
import { ConfirmationModal } from "./ConfirmationModal";

const APPROVE_WEATHER_FETCH = "approveWeatherFetch";

export const WeatherConfirmation = () => {
  useCopilotAction({
    name: APPROVE_WEATHER_FETCH,
    description:
      "Request user approval before fetching weather with weatherTool. Call this with the target city whenever the user asks for current weather. Do not call weatherTool until the user approves.",
    parameters: [
      {
        name: "location",
        type: "string",
        description: "City or place to fetch weather for",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ args, respond, status }) => {
      const { location } = args as WeatherFetchApprovalArgs;
      const isResolved = status === "complete";

      const handleApprove = () => {
        respond?.("approved");
      };

      const handleCancel = () => {
        respond?.("rejected");
      };

      return (
        <ConfirmationModal
          title="Confirmation"
          message="The agent wants to fetch live weather data for this location. Approve to continue and stream the result."
          location={location}
          isResolved={isResolved}
          resolvedLabel="Continuing…"
          onApprove={handleApprove}
          onCancel={handleCancel}
        />
      );
    },
  });

  return null;
};
