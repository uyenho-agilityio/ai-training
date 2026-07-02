import type {
  CheckPlacesToolResult,
  PlaceBrief,
  PlaceStatus,
  RouteStop,
  SketchDay,
  TripSketch,
  TripSketchToolResult,
} from "@/types";
import { PLACE_STATUSES } from "@/constants";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isPlaceStatus = (value: unknown): value is PlaceStatus =>
  typeof value === "string" && PLACE_STATUSES.includes(value as PlaceStatus);

const isPlaceBrief = (value: unknown): value is PlaceBrief => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.tagline === "string" &&
    typeof value.summary === "string" &&
    isPlaceStatus(value.status)
  );
};

const isRouteStop = (value: unknown): value is RouteStop => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.order === "number" &&
    typeof value.place === "string" &&
    typeof value.detail === "string"
  );
};

const isSketchDay = (value: unknown): value is SketchDay => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.day === "number" &&
    typeof value.label === "string" &&
    Array.isArray(value.stops) &&
    value.stops.length > 0 &&
    value.stops.every(isRouteStop)
  );
};

const isTripSketch = (value: unknown): value is TripSketch => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.atAGlance === "string" &&
    Array.isArray(value.days) &&
    value.days.length > 0 &&
    value.days.every(isSketchDay) &&
    Array.isArray(value.localTips) &&
    value.localTips.length > 0 &&
    value.localTips.every((tip: unknown) => typeof tip === "string") &&
    typeof value.isStale === "boolean"
  );
};

export const isCheckPlacesToolResult = (
  value: unknown,
): value is CheckPlacesToolResult => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.destination === "string" &&
    Array.isArray(value.places) &&
    value.places.length > 0 &&
    value.places.every(isPlaceBrief)
  );
};

export const isTripSketchToolResult = (
  value: unknown,
): value is TripSketchToolResult => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.destination === "string" && isTripSketch(value.sketch);
};

/** Default expanded day numbers after a new sketch lands on the canvas. */
export const getDefaultExpandedSketchDays = (sketch: TripSketch): number[] => {
  const firstDay = sketch.days[0]?.day ?? 0;

  return firstDay ? [firstDay] : [1];
};
