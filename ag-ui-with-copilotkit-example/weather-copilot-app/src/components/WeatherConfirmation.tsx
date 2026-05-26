"use client";

import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { ConfirmationModal } from "./ConfirmationModal";

export const WeatherConfirmation = () => {
  useHumanInTheLoop({
    name: "approveWeatherFetch",
    description:
      "Request user approval before fetching weather with weatherTool. Call this with the target city whenever the user asks for current weather. Do not call weatherTool until the user approves.",
    parameters: z.object({
      location: z.string().describe("City or place to fetch weather for"),
    }),
    render: ({ args, respond }) => {
      if (!respond) return null;
      const location = args.location ?? "";

      const handleApprove = () => {
        respond("approved");
      };

      const handleCancel = () => {
        respond("rejected");
      };

      return (
        <ConfirmationModal
          title="Confirmation"
          message="The agent wants to fetch live weather data for this location. Approve to continue and stream the result."
          location={location}
          onApprove={handleApprove}
          onCancel={handleCancel}
        />
      );
    },
  });

  return null;
};
