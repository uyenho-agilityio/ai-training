import { z } from "zod";

import { PLACE_COUNT_RULE } from "../config/planning";

export const placeStatusSchema = z.enum(["new", "starred", "dismissed"]);

export const placeBriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  status: placeStatusSchema,
});

export const routeStopSchema = z.object({
  order: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Position in the day; auto-renumbered if omitted"),
  place: z.string().min(1),
  detail: z
    .string()
    .min(1)
    .describe(
      "Required specific one-line description of what to do at this stop — write a real detail for EVERY stop across ALL days; never omit it or leave it generic like 'Visit <place>'",
    ),
});

export const sketchDaySchema = z.object({
  day: z.number().int().positive(),
  label: z
    .string()
    .min(1)
    .describe(
      'Theme only, NOT prefixed with "Day N" (the UI adds that). e.g. "Beach & Market"',
    ),
  stops: z.array(routeStopSchema).min(1),
});

export const tripSketchSchema = z.object({
  title: z.string().min(1),
  atAGlance: z.string().min(1),
  days: z.array(sketchDaySchema).min(1),
  localTips: z.array(z.string().min(1)).min(1),
  isStale: z.boolean(),
});

export const checkPlacesInputSchema = z.object({
  destination: z
    .string()
    .min(1)
    .describe("City or region in plain English (e.g. Da Nang)"),
  interests: z
    .string()
    .optional()
    .describe("Optional vibe: food, beaches, culture, relaxed pace, etc."),
  tripDays: z
    .number()
    .int()
    .min(1)
    .max(14)
    .optional()
    .describe(
      "User's trip length in days — required when sizing places; never assume a default",
    ),
  appendToExisting: z
    .boolean()
    .optional()
    .describe(
      "Set true when the user asks for more/additional places. Return ONLY the new place cards; the canvas merges them onto the existing list (e.g. 6 existing + 2 new → 8 total).",
    ),
  excludePlaceTitles: z
    .array(z.string().min(1))
    .optional()
    .describe(
      "When appendToExisting is true, pass EVERY places[].title currently on the Places tab (synced canvas). New places MUST NOT match any of these titles.",
    ),
  places: z
    .array(placeBriefSchema)
    .min(1)
    .max(36)
    .describe(
      `Suggested places for the Places tab. When appendToExisting is false/omitted, length must equal suggestPlaceCount(tripDays): ${PLACE_COUNT_RULE}. When appendToExisting is true, pass only the NEW places to add (count from user request, e.g. "2 more" → 2 places) — titles must not appear in excludePlaceTitles. Every entry must be in the destination only.`,
    ),
});

export const checkPlacesOutputSchema = z.object({
  destination: z.string(),
  appendToExisting: z.boolean().optional(),
  places: z.array(placeBriefSchema),
});

export const tripSketchInputSchema = z.object({
  destination: z.string().min(1).describe("City or region the sketch is for"),
  tripDays: z
    .number()
    .int()
    .min(1)
    .max(14)
    .optional()
    .describe("Number of days when known"),
  pace: z
    .enum(["relaxed", "moderate", "packed"])
    .optional()
    .describe("Trip pace when known"),
  starredPlaceTitles: z
    .array(z.string().min(1))
    .optional()
    .describe(
      "Reference list of every starred place title for validation. You MUST place each of these as an explicit stop with a real `detail` inside `days` yourself, spread across ALL days (ceil(count / tripDays) stops per day) — do NOT rely on the tool to inject missing titles; injection is a last-resort fallback that produces generic placeholders. Total stops in `days` must equal this list length.",
    ),
  places: z
    .array(placeBriefSchema)
    .optional()
    .describe(
      "Place briefs from checkPlacesTool (same array you just returned). Required when calling tripSketchTool right after checkPlacesTool so injected stops use real summaries on the canvas.",
    ),
  sketch: tripSketchSchema.describe(
    "Full day-by-day sketch with route stops and local tips for the Itinerary tab",
  ),
});

export const tripSketchOutputSchema = z.object({
  destination: z.string(),
  sketch: tripSketchSchema,
});

export const fullItinerarySegmentSchema = z.object({
  order: z.number().int().positive(),
  timeLabel: z
    .string()
    .min(1)
    .describe('Time block e.g. "8:30 AM", "Morning", "Lunch break"'),
  activity: z
    .string()
    .min(1)
    .describe("What to do — 1-2 sentences naming the place and the experience"),
  logistics: z
    .string()
    .optional()
    .describe(
      "Practical note: transport, duration, dress code, booking, or cost ballpark",
    ),
});

export const fullItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  label: z
    .string()
    .min(1)
    .describe(
      'Theme only, NOT prefixed with "Day N" (the UI adds that). e.g. "Beach & seafood"',
    ),
  segments: z
    .array(fullItinerarySegmentSchema)
    .min(1)
    .describe("Ordered time blocks for the day — one segment per sketch stop"),
});

export const fullItinerarySchema = z.object({
  title: z.string().min(1),
  summary: z
    .string()
    .min(1)
    .describe(
      "2-3 sentences: trip overview anchoring selected flight, hotel, and vibe",
    ),
  days: z.array(fullItineraryDaySchema).min(1),
});

const selectedFlightSchema = z.object({
  airline: z.string().min(1),
  route: z.string().min(1),
  time: z.string().min(1),
  price: z.string().min(1),
});

const selectedHotelSchema = z.object({
  name: z.string().min(1),
  rating: z.number(),
  price: z.string().min(1),
});

export const generateItineraryInputSchema = z.object({
  destination: z.string().min(1).describe("City or region for this trip"),
  sketch: tripSketchSchema.describe("Current trip sketch from the canvas"),
  selectedFlight: selectedFlightSchema
    .optional()
    .describe(
      "User-selected flight from the Book tab, when available — weave into the summary and Day 1 arrival",
    ),
  selectedHotel: selectedHotelSchema
    .optional()
    .describe(
      "User-selected hotel from the Book tab, when available — weave into the summary and check-in",
    ),
  starredPlaceTitles: z
    .array(z.string().min(1))
    .optional()
    .describe("Starred place titles to weave into activities"),
  itinerary: fullItinerarySchema.describe(
    "Full day-by-day itinerary with timed segments for the Itinerary tab",
  ),
});

export const generateItineraryOutputSchema = z.object({
  destination: z.string(),
  itinerary: fullItinerarySchema,
});

export type PlaceBrief = z.infer<typeof placeBriefSchema>;
export type TripSketch = z.infer<typeof tripSketchSchema>;
export type CheckPlacesInput = z.infer<typeof checkPlacesInputSchema>;
export type CheckPlacesOutput = z.infer<typeof checkPlacesOutputSchema>;
export type TripSketchInput = z.infer<typeof tripSketchInputSchema>;
export type TripSketchOutput = z.infer<typeof tripSketchOutputSchema>;
export type FullItinerarySegment = z.infer<typeof fullItinerarySegmentSchema>;
export type FullItineraryDay = z.infer<typeof fullItineraryDaySchema>;
export type FullItinerary = z.infer<typeof fullItinerarySchema>;
export type GenerateItineraryInput = z.infer<
  typeof generateItineraryInputSchema
>;
export type GenerateItineraryOutput = z.infer<
  typeof generateItineraryOutputSchema
>;
