import type { PlaceFilter, TabNavItem } from "@/types";

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
