import type { BookingItem, PlaceBrief, PlaceFilter } from "@/types";

export const filterPlacesByStatus = (
  places: PlaceBrief[],
  filter: PlaceFilter,
): PlaceBrief[] => {
  if (filter === "all") {
    return places.filter((place: PlaceBrief) => place.status !== "dismissed");
  }

  return places.filter((place: PlaceBrief) => place.status === filter);
};

export const togglePlaceStar = (
  places: PlaceBrief[],
  id: string,
): PlaceBrief[] =>
  places.map((place: PlaceBrief) => {
    if (place.id !== id) {
      return place;
    }

    const nextStatus: PlaceBrief["status"] =
      place.status === "starred" ? "new" : "starred";

    return { ...place, status: nextStatus };
  });

export const dismissPlace = (places: PlaceBrief[], id: string): PlaceBrief[] =>
  places.map((place: PlaceBrief) =>
    place.id === id ? { ...place, status: "dismissed" } : place,
  );

export const findBookingById = <T extends BookingItem>(
  items: T[],
  id: string | null,
): T | null => (id ? (items.find((item: T) => item.id === id) ?? null) : null);
