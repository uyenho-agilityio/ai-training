import { INITIAL_TRIP_STATE, TOOL_NAME_PATTERNS } from "@/constants";
import type {
  BookingItem,
  PlaceBrief,
  PlaceFilter,
  ToolRenderPayloadSource,
  ToolSyncKind,
} from "@/types";

import { matchesToolName } from "./tools";

export const filterPlacesByStatus = (
  places: PlaceBrief[],
  filter: PlaceFilter,
): PlaceBrief[] => {
  if (filter === "all") {
    return places?.filter((place: PlaceBrief) => place.status !== "dismissed");
  }

  return places?.filter((place: PlaceBrief) => place.status === filter);
};

export const togglePlaceStar = (
  places: PlaceBrief[],
  id: string,
): PlaceBrief[] =>
  places?.map((place: PlaceBrief) => {
    if (place.id !== id) {
      return place;
    }

    const nextStatus: PlaceBrief["status"] =
      place.status === "starred" ? "new" : "starred";

    return { ...place, status: nextStatus };
  });

export const dismissPlace = (places: PlaceBrief[], id: string): PlaceBrief[] =>
  places?.map((place: PlaceBrief) =>
    place.id === id ? { ...place, status: "dismissed" } : place,
  );

export const findBookingById = <T extends BookingItem>(
  items: T[],
  id: string | null,
): T | null => (id ? (items.find((item: T) => item.id === id) ?? null) : null);

/** Read tool output from whichever field CopilotKit populated. */
export const getToolRenderPayload = (
  props: ToolRenderPayloadSource,
): unknown | null => {
  if (props.result != null) {
    return props.result;
  }

  if (props.output != null) {
    return props.output;
  }

  return null;
};

/** Map CopilotKit tool name to canvas sync kind. */
export const resolveToolSyncKind = (toolName: string): ToolSyncKind | null => {
  if (matchesToolName(toolName, TOOL_NAME_PATTERNS.tripBookings)) {
    return "tripBookings";
  }

  if (matchesToolName(toolName, TOOL_NAME_PATTERNS.flights)) {
    return "flights";
  }

  if (matchesToolName(toolName, TOOL_NAME_PATTERNS.hotels)) {
    return "hotels";
  }

  if (matchesToolName(toolName, TOOL_NAME_PATTERNS.weather)) {
    return "weather";
  }

  return null;
};
