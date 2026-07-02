import type {
  PlaceFilter,
  TabNavItem,
  ToolSyncKind,
  TripCanvasState,
  TripSketch,
  PlaceStatus,
} from "@/types";

export const EMPTY_TRIP_SKETCH: TripSketch = {
  title: "Your trip sketch",
  atAGlance: "",
  days: [],
  localTips: [],
  isStale: false,
};

export const PLACE_FILTERS: PlaceFilter[] = [
  "all",
  "starred",
  "new",
  "dismissed",
];

export const PLACE_STATUSES: PlaceStatus[] = PLACE_FILTERS.filter(
  (filter: PlaceFilter): filter is PlaceStatus => filter !== "all",
);

export const CANVAS_TABS: TabNavItem[] = [
  { id: "places", label: "Places" },
  { id: "book", label: "Book" },
  { id: "itinerary", label: "Itinerary" },
];

export const INITIAL_TRIP_STATE: TripCanvasState = {
  activeTab: "places",
  placeFilter: "all",
  places: [],
  sketch: EMPTY_TRIP_SKETCH,
  flights: [],
  hotels: [],
  selectedFlightId: null,
  selectedHotelId: null,
  weather: null,
  itineraryPhase: "sketch",
  expandedDays: [],
};

export const TOOL_NAME_PATTERNS: Record<ToolSyncKind, readonly string[]> = {
  tripBookings: ["search-trip-booking", "searchtripbooking"],
  flights: ["search-flight", "searchflight"],
  hotels: ["search-hotel", "searchhotel"],
  weather: ["weather", "get-weather"],
  places: ["check-place", "checkplaces"],
  sketch: ["trip-sketch", "tripsketch"],
};
