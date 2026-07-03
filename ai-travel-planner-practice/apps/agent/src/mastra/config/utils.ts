import type { PlaceBrief, TripSketch } from "../schemas/travel";

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

export const getSerpApiKey = (): string => {
  const apiKey = process.env.SERPAPI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not configured");
  }

  return apiKey;
};

export const hasSerpApiKey = (): boolean =>
  Boolean(process.env.SERPAPI_API_KEY?.trim());

type SerpApiParams = Record<string, string | number>;

type SerpApiErrorPayload = {
  error?: string;
};

export const fetchSerpApi = async <T>(params: SerpApiParams): Promise<T> => {
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("api_key", getSerpApiKey());

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString());

  if (process.env.NODE_ENV !== "production") {
    const safeParams = Object.fromEntries(
      [...url.searchParams.entries()].filter(([key]) => key !== "api_key"),
    );
    console.info("[SerpAPI] request", safeParams);
  }

  if (!response.ok) {
    throw new Error(`SerpAPI request failed (${response.status})`);
  }

  const data = (await response.json()) as T & SerpApiErrorPayload;

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const formatSerpApiPrice = (
  amount: number,
  currency: string,
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

/** Extract HH:MM from SerpAPI airport datetime strings. */
export const formatSerpApiTime = (dateTime: string): string => {
  const timePart = dateTime.split(" ").pop();

  return timePart ?? dateTime;
};

/** Format a Date object as YYYY-MM-DD. */
export const formatLocalDate = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const day: string = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/** Formats a place ID based on its title and index. */
const formatPlaceId = (title: string, index: number): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug.length > 0 ? `p-${slug}` : `p-${index + 1}`;
};

/** Ensures each place has a stable id and is starred by default for the canvas. */
export const normalizePlaces = (places: PlaceBrief[]): PlaceBrief[] =>
  places.map((place: PlaceBrief, index: number) => ({
    ...place,
    id: place.id.trim() || formatPlaceId(place.title, index),
    status: place.status === "dismissed" ? "dismissed" : "starred",
  }));

/** Case-insensitive loose match for place titles in sketch stops. */
export const placeNamesMatch = (
  stopPlace: string,
  starredTitle: string,
): boolean => {
  const stop: string = stopPlace.toLowerCase().trim();
  const title: string = starredTitle.toLowerCase().trim();

  return stop === title || stop.includes(title) || title.includes(stop);
};

/** Keep only stops that match starred titles; drop empty days. */
export const filterSketchToStarredPlaces = (
  sketch: TripSketch,
  starredPlaceTitles: readonly string[],
): TripSketch => {
  if (!starredPlaceTitles.length) {
    return sketch;
  }

  const days = sketch.days
    .map((day) => ({
      ...day,
      stops: day.stops.filter((stop) =>
        starredPlaceTitles.some((title: string) =>
          placeNamesMatch(stop.place, title),
        ),
      ),
    }))
    .filter((day) => day.stops.length > 0);

  return normalizeTripSketch({
    ...sketch,
    days,
  });
};

/** Drop duplicate venue names across the sketch (keep first occurrence). */
export const dedupeSketchStopNames = (sketch: TripSketch): TripSketch => {
  const seen = new Set<string>();

  const days = sketch.days.map((day) => ({
    ...day,
    stops: day.stops.filter((stop) => {
      const key: string = stop.place.toLowerCase().trim();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }),
  }));

  return {
    ...sketch,
    days,
  };
};

/** Add any missing starred titles to the sketch — one stop each, spread across days. */
export const ensureAllStarredInSketch = (
  sketch: TripSketch,
  starredPlaceTitles: readonly string[],
  tripDays: number,
): TripSketch => {
  if (!starredPlaceTitles.length) {
    return sketch;
  }

  const daysCount: number = Math.max(1, Math.round(tripDays));
  const days = sketch.days.slice(0, daysCount).map((day) => ({
    ...day,
    stops: [...day.stops],
  }));

  while (days.length < daysCount) {
    days.push({
      day: days.length + 1,
      label: "Explore",
      stops: [],
    });
  }

  const isTitleInSketch = (title: string): boolean =>
    days.some((day) =>
      day.stops.some((stop) => placeNamesMatch(stop.place, title)),
    );

  const missingTitles: string[] = starredPlaceTitles.filter(
    (title: string) => !isTitleInSketch(title),
  );

  for (const title of missingTitles) {
    const targetDay = days.reduce((min, day) =>
      day.stops.length < min.stops.length ? day : min,
    );

    targetDay.stops.push({
      order: targetDay.stops.length + 1,
      place: title,
      detail: `Visit ${title}`,
    });
  }

  return normalizeTripSketch({
    ...sketch,
    days: days.map((day, index) => ({ ...day, day: index + 1 })),
  });
};

/** Normalizes sketch day order, labels, fills stop details, and drops empty days. */
export const normalizeTripSketch = (sketch: TripSketch): TripSketch => {
  const days = sketch.days
    .map((day) => ({
      ...day,
      label: day.label?.trim() || "Explore",
      stops: [...day.stops]
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
        .map((stop, index) => ({
          ...stop,
          order: index + 1,
          place: stop.place.trim(),
          detail: stop.detail?.trim() || `Visit ${stop.place.trim()}`,
        })),
    }))
    .filter((day) => day.stops.length > 0)
    .map((day, index) => ({ ...day, day: index + 1 }));

  return {
    ...sketch,
    isStale: false,
    days,
  };
};
