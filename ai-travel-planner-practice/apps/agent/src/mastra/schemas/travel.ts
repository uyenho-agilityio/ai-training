import { z } from "zod";

export const placeStatusSchema = z.enum(["new", "starred", "dismissed"]);

export const placeBriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  status: placeStatusSchema,
});

export const routeStopSchema = z.object({
  order: z.number().int().positive(),
  place: z.string().min(1),
  detail: z.string().min(1),
});

export const sketchDaySchema = z.object({
  day: z.number().int().positive(),
  label: z.string().min(1),
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
  places: z
    .array(placeBriefSchema)
    .min(1)
    .max(12)
    .describe(
      "Suggested places for the Places tab. Each needs id, title, tagline, summary, status.",
    ),
});

export const checkPlacesOutputSchema = z.object({
  destination: z.string(),
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
    .describe("Starred place titles from the canvas to prioritize"),
  sketch: tripSketchSchema.describe(
    "Full day-by-day sketch with route stops and local tips for the Itinerary tab",
  ),
});

export const tripSketchOutputSchema = z.object({
  destination: z.string(),
  sketch: tripSketchSchema,
});

export type PlaceBrief = z.infer<typeof placeBriefSchema>;
export type TripSketch = z.infer<typeof tripSketchSchema>;
export type CheckPlacesInput = z.infer<typeof checkPlacesInputSchema>;
export type CheckPlacesOutput = z.infer<typeof checkPlacesOutputSchema>;
export type TripSketchInput = z.infer<typeof tripSketchInputSchema>;
export type TripSketchOutput = z.infer<typeof tripSketchOutputSchema>;
