"use client";

import { memo } from "react";

import { useRenderToolCall } from "@copilotkit/react-core";

import { HIDDEN_BOOKING_TOOL_NAMES } from "@/constants";

const emptyToolRender = (): null => null;

const HideBookingToolsComponent = (): null => {
  useRenderToolCall({
    name: HIDDEN_BOOKING_TOOL_NAMES.searchFlightsTool,
    parameters: [],
    render: emptyToolRender as never,
  });

  useRenderToolCall({
    name: HIDDEN_BOOKING_TOOL_NAMES.searchFlights,
    parameters: [],
    render: emptyToolRender as never,
  });

  useRenderToolCall({
    name: HIDDEN_BOOKING_TOOL_NAMES.searchHotelsTool,
    parameters: [],
    render: emptyToolRender as never,
  });

  useRenderToolCall({
    name: HIDDEN_BOOKING_TOOL_NAMES.searchHotels,
    parameters: [],
    render: emptyToolRender as never,
  });

  return null;
};

export const HideBookingTools = memo(HideBookingToolsComponent);
