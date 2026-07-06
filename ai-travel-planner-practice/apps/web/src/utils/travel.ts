import {
  EMPTY_TRIP_SKETCH,
  GENERATE_FULL_ITINERARY_MESSAGE,
  INITIAL_TRIP_STATE,
  CANVAS_CHAT_ONLY_PREFIX,
  CANVAS_CONFIRM_PREFIX,
  CANVAS_DECLINED_PREFIX,
  TOOL_NAME_PATTERNS,
} from "@/constants";
import type {
  BookingItem,
  FlightData,
  GenerateItineraryRequirement,
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

/** User message for sketch-from-starred — lists starred titles only; agent reads trip length from canvas. */
export const buildSketchFromStarredMessage = (
  starredPlaces: PlaceBrief[],
): string => {
  const titles: string = starredPlaces
    .map((place: PlaceBrief) => place.title)
    .join(", ");

  return `Sketch from my starred places on the canvas. Starred (${starredPlaces.length}): ${titles}.`;
};

/** User message when confirming Let's make it real — agent calls generateItineraryTool. */
export const buildGenerateItineraryMessage = (
  visibleInChat: boolean = true,
  flightId: string | null = null,
  hotelId: string | null = null,
): string => {
  if (visibleInChat) {
    return GENERATE_FULL_ITINERARY_MESSAGE;
  }

  const bookingSuffix: string =
    flightId && hotelId ? `::${flightId}::${hotelId}::` : "";

  return `${CANVAS_CONFIRM_PREFIX}${GENERATE_FULL_ITINERARY_MESSAGE}${bookingSuffix}`;
};

/** True for chat-initiated confirm messages that should not render in the sidebar. */
export const isHiddenCanvasConfirmChatMessage = (text: string): boolean =>
  text.trim().startsWith(CANVAS_CONFIRM_PREFIX);

/** True for hidden decline markers after the user cancels the generate-itinerary modal. */
export const isHiddenCanvasDeclinedChatMessage = (text: string): boolean =>
  text.trim().startsWith(CANVAS_DECLINED_PREFIX);

/** Hidden user message recorded when the generate-itinerary modal is canceled. */
export const buildCanvasItineraryDeclinedMessage = (): string =>
  `${CANVAS_DECLINED_PREFIX}User declined canvas itinerary confirmation.`;

/** Chat-only user message — visible in sidebar, stripped from agent context on run. */
export const buildCanvasChatOnlyUserMessage = (visibleText: string): string =>
  `${CANVAS_CHAT_ONLY_PREFIX}${visibleText.trim()}`;

/** True for user messages that should render in chat but not reach the agent. */
export const isCanvasChatOnlyUserMessage = (text: string): boolean =>
  text.trim().startsWith(CANVAS_CHAT_ONLY_PREFIX);

/** Strip the chat-only prefix for sidebar display. */
export const stripCanvasChatOnlyPrefix = (text: string): string => {
  const trimmed: string = text.trim();

  if (!trimmed.startsWith(CANVAS_CHAT_ONLY_PREFIX)) {
    return trimmed;
  }

  return trimmed.slice(CANVAS_CHAT_ONLY_PREFIX.length).trim();
};

/** True when the message should not render in the chat sidebar. */
export const isHiddenCanvasChatMessage = (text: string): boolean =>
  isHiddenCanvasConfirmChatMessage(text) ||
  isHiddenCanvasDeclinedChatMessage(text);

/** True when text is the post-modal full-itinerary confirm (visible or hidden). */
export const isGenerateFullItineraryConfirmMessage = (
  text: string,
): boolean => {
  const trimmed: string = text.trim();

  if (isHiddenCanvasConfirmChatMessage(trimmed)) {
    const withoutPrefix: string = trimmed
      .slice(CANVAS_CONFIRM_PREFIX.length)
      .trim();
    const bookingMarker: number = withoutPrefix.indexOf("::");
    const messageText: string =
      bookingMarker !== -1
        ? withoutPrefix.slice(0, bookingMarker).trim()
        : withoutPrefix;

    return messageText === GENERATE_FULL_ITINERARY_MESSAGE;
  }

  return trimmed === GENERATE_FULL_ITINERARY_MESSAGE;
};

/** True when the user is asking to repeat the last actionable step. */
export const isRetryChatMessage = (message: string): boolean =>
  /\b(try\s+again|retry|one\s+more\s+time|regenerate(?:\s+pls)?)\b/i.test(
    message.trim(),
  );

const GENERATE_ITINERARY_INTENT_PATTERN =
  /\b(make\s+it\s+real(?:\s+now)?|let'?s\s+make\s+it\s+real|generate\s+(?:my\s+)?full\s+itinerary|build\s+(?:my\s+)?full\s+itinerary|regenerate(?:\s+(?:my\s+)?(?:full\s+)?itinerary)?)\b/i;

const BOOKING_CHAT_INTENT_PATTERN =
  /\b(book|search|find|get|show)\b.*\b(flight|flights|hotel|hotels|trip|travel)\b/i;

/** User chat asked to generate the full itinerary (not the post-modal confirm message). */
export const isGenerateItineraryChatIntent = (message: string): boolean => {
  const trimmed: string = message.trim();

  if (!trimmed || isGenerateFullItineraryConfirmMessage(trimmed)) {
    return false;
  }

  if (isHiddenCanvasDeclinedChatMessage(trimmed)) {
    return false;
  }

  if (BOOKING_CHAT_INTENT_PATTERN.test(trimmed)) {
    return false;
  }

  return GENERATE_ITINERARY_INTENT_PATTERN.test(trimmed);
};

export const buildGenerateItineraryConfirmMessage = (
  flight: FlightData | null,
  hotel: HotelData | null,
): string => {
  const flightLine: string = flight
    ? `${flight.airline} (${flight.price})`
    : "your flight";
  const hotelLine: string = hotel
    ? `${hotel.name} (${hotel.price})`
    : "your hotel";

  return `Generate a full day-by-day itinerary using ${flightLine} and ${hotelLine}? You can change selections on the Book tab before confirming.`;
};

export const findBookingById = <T extends BookingItem>(
  items: T[],
  id: string | null,
): T | null => (id ? (items.find((item: T) => item.id === id) ?? null) : null);

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

  if ((flights?.length ?? 0) === 0) {
    missing.push("flights");
  }

  if ((hotels?.length ?? 0) === 0) {
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

/** Resolve effective booking ids — mirrors the generate-itinerary modal fallback. */
export const resolveBookingSelectionIds = (
  flights: FlightData[],
  hotels: HotelData[],
  selectedFlightId: string | null,
  selectedHotelId: string | null,
): { flightId: string | null; hotelId: string | null } => ({
  flightId: selectedFlightId ?? flights[0]?.id ?? null,
  hotelId: selectedHotelId ?? hotels[0]?.id ?? null,
});

/** Payload for selectBookingsTool canvasReadiness — keep in sync with agent schema. */
export const buildCanvasReadinessInput = ({
  places,
  flights,
  hotels,
  selectedFlightId,
  selectedHotelId,
  sketch,
}: GenerateItineraryReadinessInput): {
  placesCount: number;
  flightsCount: number;
  hotelsCount: number;
  sketchDayStops: number[];
  localTipsCount: number;
  selectedFlightId: string | null;
  selectedHotelId: string | null;
} => {
  const { flightId, hotelId } = resolveBookingSelectionIds(
    flights,
    hotels,
    selectedFlightId,
    selectedHotelId,
  );

  return {
    placesCount: places?.length ?? 0,
    flightsCount: flights?.length ?? 0,
    hotelsCount: hotels?.length ?? 0,
    sketchDayStops: sketch?.days?.map((day) => day.stops?.length ?? 0) ?? [],
    localTipsCount: sketch?.localTips?.length ?? 0,
    selectedFlightId: flightId,
    selectedHotelId: hotelId,
  };
};

const GENERATE_CONFIRM_CHAT_PATTERN =
  /^(go|yes|yep|yeah|yes\s+pls|yes\s+please|ok|okay|confirm|proceed|let'?s\s+go|do\s+it)$/i;

/** Short affirmations that confirm the open generate-itinerary modal from chat. */
export const isGenerateConfirmChatIntent = (message: string): boolean =>
  GENERATE_CONFIRM_CHAT_PATTERN.test(message.trim());

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
    fullItinerary: pickSynced(
      toolPatch.fullItinerary,
      resolved.fullItinerary,
      null,
    ),
    activeTab: pickSynced(toolPatch.activeTab, resolved.activeTab, "places"),
    selectedFlightId: pickSynced(
      toolPatch.selectedFlightId,
      resolved.selectedFlightId,
      null,
    ),
    selectedHotelId: pickSynced(
      toolPatch.selectedHotelId,
      resolved.selectedHotelId,
      null,
    ),
    isGenerateConfirm: pickSynced(
      toolPatch.isGenerateConfirm,
      resolved.isGenerateConfirm,
      false,
    ),
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
