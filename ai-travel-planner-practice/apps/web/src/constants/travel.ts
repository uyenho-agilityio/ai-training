import type {
  PlaceFilter,
  TabNavItem,
  ToolSyncKind,
  TripCanvasState,
} from "@/types";
import { MOCK_PLACES, MOCK_SKETCH } from "./mock-data";

export const PLACE_FILTERS: PlaceFilter[] = [
  "all",
  "starred",
  "new",
  "dismissed",
];

export const CANVAS_TABS: TabNavItem[] = [
  { id: "places", label: "Places" },
  { id: "book", label: "Book" },
  { id: "itinerary", label: "Itinerary" },
];

export const INITIAL_TRIP_STATE: TripCanvasState = {
  activeTab: "places",
  placeFilter: "all",
  places: MOCK_PLACES,
  sketch: MOCK_SKETCH,
  flights: [],
  hotels: [],
  selectedFlightId: null,
  selectedHotelId: null,
  weather: null,
  itineraryPhase: "sketch",
  expandedDays: [1],
};

export const TOOL_NAME_PATTERNS: Record<ToolSyncKind, readonly string[]> = {
  tripBookings: ["search-trip-booking", "searchtripbooking"],
  flights: ["search-flight", "searchflight"],
  hotels: ["search-hotel", "searchhotel"],
  weather: ["weather", "get-weather"],
};
