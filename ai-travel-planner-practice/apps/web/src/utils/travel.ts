import { TOOL_NAME_PATTERNS } from "@/constants";
import type {
  BookingItem,
  FlightData,
  HotelData,
  PlaceBrief,
  PlaceFilter,
  ToolDrivenCanvasPatch,
  ToolRenderPayloadSource,
  ToolSyncKind,
  TripCanvasState,
  TripSketch,
  AssistantMessageContent,
  TextMessagePart,
} from "@/types";
import { EMPTY_TRIP_SKETCH, INITIAL_TRIP_STATE } from "@/constants";
import { matchesToolName } from "./tools";

/** Tool-synced value wins when present; otherwise fall back to co-agent state. */
const pickSynced = <T>(
  synced: T | undefined,
  base: T | undefined,
  fallback: T,
): T => (synced !== undefined ? synced : (base ?? fallback));

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

/** User message for sketch-from-starred — short confirm only; agent reads rules from instructions. */
export const buildSketchFromStarredMessage = (
  starredPlaces: PlaceBrief[],
  tripDays: number,
): string => {
  const titles: string = starredPlaces
    .map((place: PlaceBrief) => place.title)
    .join(", ");

  return `Sketch from my starred places on the canvas. Starred (${starredPlaces.length}): ${titles}. ${tripDays} day${tripDays === 1 ? "" : "s"}. Include every starred place in the route.`;
};

export const findBookingById = <T extends BookingItem>(
  items: T[],
  id: string | null,
): T | null => (id ? (items.find((item: T) => item.id === id) ?? null) : null);

export type GenerateItineraryRequirement =
  | "places"
  | "flights"
  | "hotels"
  | "routes"
  | "localTips";

export type GenerateItineraryReadinessInput = {
  places: PlaceBrief[];
  flights: FlightData[];
  hotels: HotelData[];
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  sketch: TripSketch;
};

export type GenerateItineraryReadiness = {
  isReady: boolean;
  missing: GenerateItineraryRequirement[];
};

/** Whether canvas has enough trip data to generate a full itinerary. */
export const getGenerateItineraryReadiness = ({
  places,
  flights,
  hotels,
  selectedFlightId,
  selectedHotelId,
  sketch,
}: GenerateItineraryReadinessInput): GenerateItineraryReadiness => {
  const missing: GenerateItineraryRequirement[] = [];

  if ((places?.length ?? 0) === 0) {
    missing.push("places");
  }

  if ((flights?.length ?? 0) === 0 || selectedFlightId == null) {
    missing.push("flights");
  }

  if ((hotels?.length ?? 0) === 0 || selectedHotelId == null) {
    missing.push("hotels");
  }

  const hasRoutes =
    (sketch?.days?.length ?? 0) > 0 &&
    sketch.days.every((day) => (day.stops?.length ?? 0) > 0);

  if (!hasRoutes) {
    missing.push("routes");
  }

  if ((sketch?.localTips?.length ?? 0) === 0) {
    missing.push("localTips");
  }

  return {
    isReady: missing.length === 0,
    missing,
  };
};

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
  const kinds = Object.keys(TOOL_NAME_PATTERNS) as ToolSyncKind[];

  return (
    kinds.find((kind: ToolSyncKind) =>
      matchesToolName(toolName, TOOL_NAME_PATTERNS[kind]),
    ) ?? null
  );
};

/** Merge co-agent state with tool-driven patch — same pattern as Book (flights/hotels). */
export const mergeCanvasState = (
  base: TripCanvasState | undefined,
  toolPatch: ToolDrivenCanvasPatch,
): TripCanvasState => {
  const resolved: TripCanvasState = base ?? INITIAL_TRIP_STATE;

  return {
    ...resolved,
    places: pickSynced(toolPatch.places, resolved.places, []),
    sketch: pickSynced(toolPatch.sketch, resolved.sketch, EMPTY_TRIP_SKETCH),
    flights: pickSynced(toolPatch.flights, resolved.flights, []),
    hotels: pickSynced(toolPatch.hotels, resolved.hotels, []),
    weather: pickSynced(toolPatch.weather, resolved.weather, null),
    expandedDays: pickSynced(toolPatch.expandedDays, resolved.expandedDays, []),
    itineraryPhase: pickSynced(
      toolPatch.itineraryPhase,
      resolved.itineraryPhase,
      "sketch",
    ),
    activeTab: pickSynced(toolPatch.activeTab, resolved.activeTab, "places"),
    selectedFlightId: resolved.selectedFlightId,
    selectedHotelId: resolved.selectedHotelId,
    placeFilter: resolved.placeFilter,
  };
};

/** True when sketch has day-by-day content. */
export const hasSketchDays = (sketch: TripSketch | undefined): boolean =>
  (sketch?.days?.length ?? 0) > 0 && sketch !== EMPTY_TRIP_SKETCH;

/** Normalize assistant message content from string or AG-UI text parts. */
export const getAssistantMessageText = (
  content: AssistantMessageContent,
): string => {
  if (typeof content === "string") {
    return content;
  }

  if (!content?.length) {
    return "";
  }

  return content
    .filter((part: TextMessagePart) => part.type === "text")
    .map((part: TextMessagePart) => part.text)
    .join(" ");
};
