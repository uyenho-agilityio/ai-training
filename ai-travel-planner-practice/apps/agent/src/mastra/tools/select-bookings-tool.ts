import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const selectBookingsInputSchema = z.object({
  selectedFlightId: z
    .string()
    .min(1)
    .optional()
    .describe("id from current canvas flights list, e.g. flight-1"),
  selectedHotelId: z
    .string()
    .min(1)
    .optional()
    .describe("id from current canvas hotels list, e.g. hotel-2"),
  suggestGenerateItinerary: z
    .boolean()
    .optional()
    .describe(
      "true when the user also wants to generate the full itinerary after selecting",
    ),
});

const selectBookingsOutputSchema = z.object({
  selectedFlightId: z.string().nullable(),
  selectedHotelId: z.string().nullable(),
  suggestGenerateItinerary: z.boolean(),
});

export const selectBookingsTool = createTool({
  id: "select-bookings",
  description:
    "Set the user's selected flight and/or hotel on the Book tab, or request the canvas confirmation modal before generating a full itinerary. Call when the user asks you to choose, pick, or recommend options from current results, or asks from chat to make/generate a full itinerary. Match ids from canvas state (flight-1, hotel-2, etc.) when selecting bookings.",
  inputSchema: selectBookingsInputSchema,
  outputSchema: selectBookingsOutputSchema,
  execute: async (inputData) => ({
    selectedFlightId: inputData.selectedFlightId ?? null,
    selectedHotelId: inputData.selectedHotelId ?? null,
    suggestGenerateItinerary: inputData.suggestGenerateItinerary ?? false,
  }),
});
