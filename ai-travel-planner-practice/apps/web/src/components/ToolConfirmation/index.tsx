"use client";

import { memo, useCallback, useState, type ReactElement } from "react";

import { useHumanInTheLoop } from "@copilotkit/react-core";

import { Confirmation, LoadingIndicator } from "@/components";
import type {
  ToolConfirmationArgs,
  ToolConfirmationRenderStatus,
  ToolConfirmationResult,
} from "@/types";

type ToolConfirmationPromptProps = {
  args: ToolConfirmationArgs;
  respond: (result: ToolConfirmationResult) => void;
};

const ToolConfirmationPromptComponent = ({
  args,
  respond,
}: ToolConfirmationPromptProps): ReactElement => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const handleConfirm = useCallback((): void => {
    setIsDismissed(true);
    respond({ approved: true });
  }, [respond, args.actionType]);

  const handleCancel = useCallback((): void => {
    setIsDismissed(true);
    respond({ approved: false });
  }, [respond]);

  if (isDismissed) {
    return <></>;
  }

  return (
    <Confirmation
      variant="inline"
      message={args.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

const ToolConfirmationPrompt = memo(ToolConfirmationPromptComponent);

const ToolConfirmationComponent = (): null => {
  const renderConfirmation = useCallback(
    (props: {
      status: string;
      args: {
        actionType?: string;
        message?: string;
        summary?: string;
      };
      respond?: (result: ToolConfirmationResult) => void;
    }): ReactElement => {
      const status = props.status as ToolConfirmationRenderStatus;
      const { args, respond } = props;

      if (status === "complete") {
        return <></>;
      }

      if (status === "inProgress") {
        return <LoadingIndicator size="sm" label="Preparing confirmation…" />;
      }

      if (status !== "executing" || !respond) {
        return <></>;
      }

      const message = args.message?.trim().length
        ? args.summary?.trim().length
          ? `${args.message}\n${args.summary}`
          : args.message
        : "Continue with this action?";

      return (
        <ToolConfirmationPrompt
          args={{
            actionType: args.actionType ?? "weather",
            message,
            summary: args.summary,
          }}
          respond={respond}
        />
      );
    },
    [],
  );

  useHumanInTheLoop({
    name: "confirmToolAction",
    description:
      "Ask the user to confirm before calling weather or booking search tools. Required before weatherTool, searchHotelsTool, searchFlightsTool, or searchTripBookingsTool.",
    parameters: [
      {
        name: "actionType",
        type: "string",
        description: 'One of: "weather", "hotels", "flights", "trip-bookings".',
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "Short Y/N question shown in chat.",
        required: true,
      },
      {
        name: "summary",
        type: "string",
        description: "Optional extra detail shown below the question.",
        required: false,
      },
    ],
    followUp: true,
    render: renderConfirmation,
  });

  return null;
};

export const ToolConfirmation = memo(ToolConfirmationComponent);
