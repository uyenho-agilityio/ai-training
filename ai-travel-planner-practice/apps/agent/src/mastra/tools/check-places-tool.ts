import { createTool } from "@mastra/core/tools";

import {
  fetchSerpApi,
  hasSerpApiKey,
  normalizePlaces,
  placeNamesMatch,
} from "../config/utils";
import { checkPlacesInputSchema, checkPlacesOutputSchema } from "../schemas";
import type { PlaceBrief } from "../schemas/travel";
import { getLatestUserMessageText } from "../config/generate-itinerary-gate";

/** Must match apps/web `MORE_PLACES_EXCLUDE_PREFIX` — canvas injects existing titles. */
const MORE_PLACES_EXCLUDE_PREFIX = "__more_places_exclude__:";

type SerpApiLocalResult = {
  title?: string;
  description?: string;
  type?: string;
  types?: string[];
  address?: string;
};

type SerpApiMapsResponse = {
  local_results?: SerpApiLocalResult[];
};

const MOCK_PLACE_SUFFIXES: readonly string[] = [
  "Night Market",
  "Old Town Walk",
  "Sunset Viewpoint",
  "Local Cooking Class",
  "Botanical Garden",
  "Artisan Village",
  "Coastal Promenade",
  "Temple Complex",
  "Waterfall Trail",
  "Seafood Harbor",
  "Culture Museum",
  "Island Day Trip",
];

/** Drop places that already appear on the canvas (title match). */
const filterExcludedPlaces = (
  places: PlaceBrief[],
  excludePlaceTitles: readonly string[],
): PlaceBrief[] => {
  if (!excludePlaceTitles.length) {
    return places;
  }

  return places.filter(
    (place: PlaceBrief) =>
      !excludePlaceTitles.some((title: string) =>
        placeNamesMatch(place.title, title),
      ),
  );
};

/** Deduplicate title list (case-insensitive trim). */
const uniqueTitles = (titles: readonly string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const title of titles) {
    const trimmed: string = title.trim();
    const key: string = trimmed.toLowerCase();

    if (!trimmed || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
};

/** Parse exclude titles injected by the web chat for "find N more" requests. */
const parseExcludeTitlesFromUserMessage = (text: string | null): string[] => {
  if (!text || !text.includes(MORE_PLACES_EXCLUDE_PREFIX)) {
    return [];
  }

  const markerIndex: number = text.indexOf("EXCLUDE_TITLES:");

  if (markerIndex === -1) {
    return [];
  }

  return text
    .slice(markerIndex + "EXCLUDE_TITLES:".length)
    .split("\n")
    .map((line: string) => line.replace(/^\s*-\s*/, "").trim())
    .filter((line: string) => line.length > 0);
};

/** Deterministic unique placeholders when SerpAPI is unavailable. */
const buildMockExtraPlaces = (
  destination: string,
  count: number,
  excludePlaceTitles: readonly string[],
): PlaceBrief[] => {
  const fresh: PlaceBrief[] = [];
  const city: string = destination.trim() || "Destination";

  for (const suffix of MOCK_PLACE_SUFFIXES) {
    const title: string = `${city} ${suffix}`;

    if (
      excludePlaceTitles.some((excluded: string) =>
        placeNamesMatch(title, excluded),
      ) ||
      fresh.some((place: PlaceBrief) => placeNamesMatch(place.title, title))
    ) {
      continue;
    }

    fresh.push({
      id: `p-extra-${fresh.length + 1}`,
      title,
      tagline: "Extra pick",
      summary: `A worthwhile add-on near ${city} for your expanded list.`,
      status: "starred",
    });

    if (fresh.length >= count) {
      return fresh;
    }
  }

  let index: number = 1;

  while (fresh.length < count) {
    const title: string = `${city} Discovery Spot ${index}`;
    index += 1;

    if (
      excludePlaceTitles.some((excluded: string) =>
        placeNamesMatch(title, excluded),
      )
    ) {
      continue;
    }

    fresh.push({
      id: `p-extra-${fresh.length + 1}`,
      title,
      tagline: "Extra pick",
      summary: `Another local highlight around ${city}.`,
      status: "starred",
    });
  }

  return fresh;
};

/** Fetch attractions via SerpAPI Google Maps, skipping excluded titles. */
const fetchSerpExtraPlaces = async (
  destination: string,
  count: number,
  excludePlaceTitles: readonly string[],
): Promise<PlaceBrief[]> => {
  const data = await fetchSerpApi<SerpApiMapsResponse>({
    engine: "google_maps",
    type: "search",
    q: `top attractions things to do in ${destination}`,
    location: destination,
    m: 25000,
    hl: "en",
  });

  const fresh: PlaceBrief[] = [];

  for (const result of data.local_results ?? []) {
    const title: string = result.title?.trim() ?? "";

    if (!title) {
      continue;
    }

    if (
      excludePlaceTitles.some((excluded: string) =>
        placeNamesMatch(title, excluded),
      ) ||
      fresh.some((place: PlaceBrief) => placeNamesMatch(place.title, title))
    ) {
      continue;
    }

    const tagline: string =
      result.type?.trim() || result.types?.[0]?.trim() || "Local highlight";
    const summary: string =
      result.description?.trim() ||
      result.address?.trim() ||
      `Popular spot in ${destination}.`;

    fresh.push({
      id: `p-serp-${fresh.length + 1}`,
      title,
      tagline,
      summary,
      status: "starred",
    });

    if (fresh.length >= count) {
      break;
    }
  }

  return fresh;
};

/** Ensure append requests return enough unique places (filter + SerpAPI/mock backfill). */
const ensureUniqueAppendPlaces = async (
  destination: string,
  requestedCount: number,
  candidatePlaces: PlaceBrief[],
  excludePlaceTitles: readonly string[],
): Promise<PlaceBrief[]> => {
  const places = filterExcludedPlaces(candidatePlaces, excludePlaceTitles);

  if (places.length >= requestedCount) {
    return places.slice(0, requestedCount);
  }

  const needed: number = requestedCount - places.length;
  const excludeWithAccepted: string[] = uniqueTitles([
    ...excludePlaceTitles,
    ...places.map((place: PlaceBrief) => place.title),
  ]);

  let extras: PlaceBrief[] = [];

  if (hasSerpApiKey()) {
    try {
      extras = await fetchSerpExtraPlaces(
        destination,
        needed,
        excludeWithAccepted,
      );
    } catch {
      extras = [];
    }
  }

  if (extras.length < needed) {
    extras = [
      ...extras,
      ...buildMockExtraPlaces(destination, needed - extras.length, [
        ...excludeWithAccepted,
        ...extras.map((place: PlaceBrief) => place.title),
      ]),
    ];
  }

  return normalizePlaces([...places, ...extras].slice(0, requestedCount));
};

export const checkPlacesTool = createTool({
  id: "check-places",
  description:
    "Populate the Places tab with structured destination suggestions. Call when the user wants ideas, spots, activities, or what to see — before building a day-by-day sketch. When appending more places, pass excludePlaceTitles (and honor any EXCLUDE_TITLES block in the user message) and ONLY genuinely new venues.",
  inputSchema: checkPlacesInputSchema,
  outputSchema: checkPlacesOutputSchema,
  execute: async (inputData, context) => {
    const destination = inputData.destination.trim();
    const appendToExisting = inputData.appendToExisting === true;
    const requestedCount: number = Math.max(1, inputData.places.length);
    const latestUserMessage: string | null = getLatestUserMessageText(
      context?.agent?.messages ?? [],
    );
    const excludePlaceTitles: string[] = uniqueTitles([
      ...(inputData.excludePlaceTitles ?? []),
      ...parseExcludeTitlesFromUserMessage(latestUserMessage),
    ]);
    const normalizedPlaces = normalizePlaces(inputData.places);

    if (!appendToExisting) {
      return {
        destination,
        appendToExisting: false,
        places: normalizedPlaces,
      };
    }

    const places = await ensureUniqueAppendPlaces(
      destination,
      requestedCount,
      normalizedPlaces,
      excludePlaceTitles,
    );

    if (places.length === 0) {
      throw new Error(
        "appendToExisting requires genuinely NEW places. Pass excludePlaceTitles from the canvas and invent different venues, then retry.",
      );
    }

    return {
      destination,
      appendToExisting: true,
      places,
    };
  },
});
