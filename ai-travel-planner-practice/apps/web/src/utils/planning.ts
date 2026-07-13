import type {
  CheckPlacesToolResult,
  FlightData,
  FullItinerary,
  FullItineraryDay,
  FullItinerarySegment,
  GenerateItineraryToolResult,
  HotelData,
  PlaceBrief,
  PlaceStatus,
  RouteStop,
  SelectBookingsToolResult,
  SketchDay,
  TripSketch,
  TripSketchToolResult,
} from "@/types";
import { MORE_PLACES_EXCLUDE_PREFIX, PLACE_STATUSES } from "@/constants";

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

  // Only `place` is required; order/detail are normalized by the agent tool.
  return (
    typeof value.place === "string" &&
    value.place.length > 0 &&
    (value.order === undefined || typeof value.order === "number") &&
    (value.detail === undefined || typeof value.detail === "string")
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

const isFullItinerarySegment = (
  value: unknown,
): value is FullItinerarySegment => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.order === "number" &&
    typeof value.timeLabel === "string" &&
    typeof value.activity === "string" &&
    (value.logistics === undefined || typeof value.logistics === "string")
  );
};

const isFullItineraryDay = (value: unknown): value is FullItineraryDay => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.day === "number" &&
    typeof value.label === "string" &&
    Array.isArray(value.segments) &&
    value.segments.length > 0 &&
    value.segments.every(isFullItinerarySegment)
  );
};

const isFullItinerary = (value: unknown): value is FullItinerary => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.days) &&
    value.days.length > 0 &&
    value.days.every(isFullItineraryDay)
  );
};

export const isGenerateItineraryToolResult = (
  value: unknown,
): value is GenerateItineraryToolResult => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.destination === "string" && isFullItinerary(value.itinerary)
  );
};

/** Expand every day after a full itinerary lands on the canvas. */
export const getDefaultExpandedFullItineraryDays = (
  itinerary: FullItinerary,
): number[] => itinerary.days.map((day: FullItineraryDay) => day.day);

export const isSelectBookingsToolResult = (
  value: unknown,
): value is SelectBookingsToolResult => {
  if (!isRecord(value)) {
    return false;
  }

  const flightId = value.selectedFlightId;
  const hotelId = value.selectedHotelId;

  if (
    (flightId !== null && typeof flightId !== "string") ||
    (hotelId !== null && typeof hotelId !== "string") ||
    typeof value.suggestGenerateItinerary !== "boolean"
  ) {
    return false;
  }

  if (value.readinessBlocked !== undefined) {
    if (typeof value.readinessBlocked !== "boolean") {
      return false;
    }
  }

  if (value.blockedMessage !== undefined) {
    if (typeof value.blockedMessage !== "string") {
      return false;
    }
  }

  if (value.missing !== undefined) {
    if (
      !Array.isArray(value.missing) ||
      !value.missing.every(
        (item: unknown) =>
          item === "places" ||
          item === "flights" ||
          item === "hotels" ||
          item === "routes" ||
          item === "localTips",
      )
    ) {
      return false;
    }
  }

  return true;
};

/** Detect chat asks to append more place cards onto an existing Places list. */
export const isMorePlacesRequest = (text: string): boolean => {
  const lower: string = text.toLowerCase().trim();

  return (
    /\b(more|additional|extra)\s+(places?|spots?|attractions?|venues?)\b/.test(
      lower,
    ) ||
    /\bfind\s+\d+\s+more\b/.test(lower) ||
    /\b\d+\s+more\s+(places?|spots?|attractions?)\b/.test(lower) ||
    /\bthêm\s+\d*\s*(địa điểm|chỗ|nơi)\b/.test(lower)
  );
};

/**
 * Hidden agent payload for append-places turns — carries canvas titles the tool
 * must not reuse. Pair with a chat-only visible user message.
 */
export const buildMorePlacesExcludeMessage = (
  userText: string,
  placeTitles: readonly string[],
): string => {
  const titlesBlock: string = placeTitles
    .map((title: string) => title.trim())
    .filter((title: string) => title.length > 0)
    .map((title: string) => `- ${title}`)
    .join("\n");

  return [
    `${MORE_PLACES_EXCLUDE_PREFIX}${userText.trim()}`,
    "Call checkPlacesTool with appendToExisting: true and excludePlaceTitles from EXCLUDE_TITLES below. Return ONLY brand-new places — never reuse these titles.",
    "EXCLUDE_TITLES:",
    titlesBlock,
  ].join("\n");
};
