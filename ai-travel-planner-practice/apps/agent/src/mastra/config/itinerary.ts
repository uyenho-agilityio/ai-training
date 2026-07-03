import type {
  FullItinerary,
  FullItineraryDay,
  TripSketch,
} from "../schemas/travel";
import { placeNamesMatch } from "./utils";

/** Sort segment order and renumber within each day. */
const normalizeItineraryDays = (days: FullItineraryDay[]): FullItineraryDay[] =>
  days.map((day: FullItineraryDay) => ({
    ...day,
    segments: [...day.segments]
      .sort((left, right) => left.order - right.order)
      .map((segment, index) => ({
        ...segment,
        order: index + 1,
      })),
  }));

/** Ensure every sketch stop for a day has a matching segment activity. */
const ensureSketchStopsInDay = (
  day: FullItineraryDay,
  sketchStops: TripSketch["days"][number]["stops"],
): FullItineraryDay => {
  const segments = [...day.segments];

  for (const stop of sketchStops) {
    const isCovered: boolean = segments.some((segment) =>
      placeNamesMatch(segment.activity, stop.place),
    );

    if (!isCovered) {
      segments.push({
        order: segments.length + 1,
        timeLabel: "Flexible",
        activity: stop.detail?.trim()
          ? `${stop.place} — ${stop.detail.trim()}`
          : `Visit ${stop.place}`,
        logistics: "From your trip sketch",
      });
    }
  }

  return {
    ...day,
    segments,
  };
};

/** Pad or trim days to match sketch length and inject missing sketch stops. */
export const normalizeFullItinerary = (
  itinerary: FullItinerary,
  sketch: TripSketch,
  starredPlaceTitles?: readonly string[],
): FullItinerary => {
  const sketchDays = sketch.days;
  const days: FullItineraryDay[] = sketchDays.map((sketchDay, index) => {
    const existingDay: FullItineraryDay | undefined = itinerary.days[index];
    const baseDay: FullItineraryDay = existingDay ?? {
      day: sketchDay.day,
      label: sketchDay.label,
      segments: [],
    };

    return ensureSketchStopsInDay(
      {
        ...baseDay,
        day: sketchDay.day,
        label: baseDay.label || sketchDay.label,
      },
      sketchDay.stops,
    );
  });

  const normalizedDays = normalizeItineraryDays(days);

  if (starredPlaceTitles?.length) {
    const coveredTitles = new Set<string>();

    for (const day of normalizedDays) {
      for (const segment of day.segments) {
        for (const title of starredPlaceTitles) {
          if (placeNamesMatch(segment.activity, title)) {
            coveredTitles.add(title.toLowerCase().trim());
          }
        }
      }
    }

    const missingTitles = starredPlaceTitles.filter(
      (title: string) => !coveredTitles.has(title.toLowerCase().trim()),
    );

    for (const title of missingTitles) {
      const targetDay = normalizedDays.reduce((min, day) =>
        day.segments.length < min.segments.length ? day : min,
      );

      targetDay.segments.push({
        order: targetDay.segments.length + 1,
        timeLabel: "Flexible",
        activity: `Visit ${title}`,
        logistics: "Starred on your Places tab",
      });
    }
  }

  return {
    ...itinerary,
    days: normalizeItineraryDays(normalizedDays),
  };
};
