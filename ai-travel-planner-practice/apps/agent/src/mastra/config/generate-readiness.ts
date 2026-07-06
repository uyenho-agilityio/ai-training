import { z } from "zod";

export const GENERATE_ITINERARY_REQUIREMENTS = [
  "places",
  "flights",
  "hotels",
  "routes",
  "localTips",
] as const;

export type GenerateItineraryRequirement =
  (typeof GENERATE_ITINERARY_REQUIREMENTS)[number];

export const canvasReadinessInputSchema = z.object({
  placesCount: z
    .number()
    .int()
    .min(0)
    .describe("places.length from synced canvas state"),
  flightsCount: z
    .number()
    .int()
    .min(0)
    .describe("flights.length from synced canvas state"),
  hotelsCount: z
    .number()
    .int()
    .min(0)
    .describe("hotels.length from synced canvas state"),
  sketchDayStops: z
    .array(z.number().int().min(0))
    .describe(
      "stop count for each sketch day in order, e.g. [3, 3, 2] — same check as the disabled Let's make it real button",
    ),
  localTipsCount: z
    .number()
    .int()
    .min(0)
    .describe("sketch.localTips.length from synced canvas state"),
  selectedFlightId: z
    .string()
    .min(1)
    .nullable()
    .optional()
    .describe(
      "selectedFlightId from synced canvas state — set when the user clicks Select on the Book tab",
    ),
  selectedHotelId: z
    .string()
    .min(1)
    .nullable()
    .optional()
    .describe(
      "selectedHotelId from synced canvas state — set when the user clicks Select on the Book tab",
    ),
});

export type CanvasReadinessInput = z.infer<typeof canvasReadinessInputSchema>;

export type GenerateItineraryReadiness = {
  isReady: boolean;
  missing: GenerateItineraryRequirement[];
};

/** Mirror apps/web getGenerateItineraryReadiness — keep chat and canvas button in sync. */
export const getGenerateItineraryReadiness = (
  input: CanvasReadinessInput,
): GenerateItineraryReadiness => {
  const missing: GenerateItineraryRequirement[] = [];

  if (input.placesCount === 0) {
    missing.push("places");
  }

  if (input.flightsCount === 0) {
    missing.push("flights");
  }

  if (input.hotelsCount === 0) {
    missing.push("hotels");
  }

  const hasRoutes =
    input.sketchDayStops.length > 0 &&
    input.sketchDayStops.every((stopCount: number) => stopCount > 0);

  if (!hasRoutes) {
    missing.push("routes");
  }

  if (input.localTipsCount === 0) {
    missing.push("localTips");
  }

  return {
    isReady: missing.length === 0,
    missing,
  };
};

const MISSING_LABELS: Record<GenerateItineraryRequirement, string> = {
  places: "places",
  flights: "flight search results",
  hotels: "hotel search results",
  routes: "day-by-day routes",
  localTips: "local tips",
};

/** Human-readable message for chat when generation is blocked. */
export const formatGenerateItineraryBlockedMessage = (
  missing: readonly GenerateItineraryRequirement[],
): string => {
  const labels = missing.map(
    (requirement: GenerateItineraryRequirement) => MISSING_LABELS[requirement],
  );

  return `Add ${labels.join(", ")} to generate your full itinerary.`;
};

/** Human-readable message when Book tab flight/hotel selections are missing. */
export const formatBookingSelectionBlockedMessage = (): string =>
  "Select a flight and hotel on the Book tab before generating your full itinerary.";
