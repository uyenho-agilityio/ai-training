import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  canvasReadinessInputSchema,
  formatBookingSelectionBlockedMessage,
  formatGenerateItineraryBlockedMessage,
  getGenerateItineraryReadiness,
  type GenerateItineraryRequirement,
} from "../config/generate-readiness";

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
      "true when the user wants to generate the full itinerary (Let's make it real)",
    ),
  canvasReadiness: canvasReadinessInputSchema
    .optional()
    .describe(
      "Required when suggestGenerateItinerary is true — pass counts from synced canvas state so generation is blocked when the Let's make it real button would be disabled",
    ),
});

const selectBookingsOutputSchema = z.object({
  selectedFlightId: z.string().nullable(),
  selectedHotelId: z.string().nullable(),
  suggestGenerateItinerary: z.boolean(),
  readinessBlocked: z
    .boolean()
    .optional()
    .describe(
      "true when suggestGenerateItinerary was requested but canvas is not ready",
    ),
  missing: z
    .array(z.enum(["places", "flights", "hotels", "routes", "localTips"]))
    .optional()
    .describe("Missing canvas requirements when readinessBlocked is true"),
  blockedMessage: z
    .string()
    .optional()
    .describe("Same guidance as the disabled Let's make it real button"),
  awaitingCanvasConfirmation: z
    .boolean()
    .optional()
    .describe(
      "true when the canvas confirmation modal was opened — agent must stop and wait for user confirm before generateItineraryTool",
    ),
  bookingsAlreadySelected: z
    .boolean()
    .optional()
    .describe(
      "true when synced canvas already has selectedFlightId and selectedHotelId — do not claim you selected bookings in chat",
    ),
});

export const selectBookingsTool = createTool({
  id: "select-bookings",
  description:
    "Set the user's selected flight and/or hotel on the Book tab, or request the canvas confirmation modal before generating a full itinerary. For make-it-real / full-itinerary requests: pass suggestGenerateItinerary: true + canvasReadiness (counts AND selectedFlightId/selectedHotelId from synced canvas state). Omit top-level selectedFlightId/selectedHotelId unless the user explicitly asks you to pick a specific booking.",
  inputSchema: selectBookingsInputSchema,
  outputSchema: selectBookingsOutputSchema,
  execute: async (inputData) => {
    const selectedFlightId: string | null = inputData.selectedFlightId ?? null;
    const selectedHotelId: string | null = inputData.selectedHotelId ?? null;
    const wantsGenerate: boolean = inputData.suggestGenerateItinerary ?? false;

    if (!wantsGenerate) {
      return {
        selectedFlightId,
        selectedHotelId,
        suggestGenerateItinerary: false,
      };
    }

    if (!inputData.canvasReadiness) {
      const missing: GenerateItineraryRequirement[] = [
        "places",
        "flights",
        "hotels",
        "routes",
        "localTips",
      ];

      return {
        selectedFlightId,
        selectedHotelId,
        suggestGenerateItinerary: false,
        readinessBlocked: true,
        missing,
        blockedMessage:
          "Pass canvasReadiness from synced canvas state before requesting full itinerary generation.",
      };
    }

    const readiness = getGenerateItineraryReadiness(inputData.canvasReadiness);

    if (!readiness.isReady) {
      return {
        selectedFlightId,
        selectedHotelId,
        suggestGenerateItinerary: false,
        readinessBlocked: true,
        missing: readiness.missing,
        blockedMessage: formatGenerateItineraryBlockedMessage(
          readiness.missing,
        ),
      };
    }

    const resolvedFlightId: string | null =
      inputData.selectedFlightId ??
      inputData.canvasReadiness.selectedFlightId ??
      null;
    const resolvedHotelId: string | null =
      inputData.selectedHotelId ??
      inputData.canvasReadiness.selectedHotelId ??
      null;

    if (!resolvedFlightId || !resolvedHotelId) {
      return {
        selectedFlightId: resolvedFlightId,
        selectedHotelId: resolvedHotelId,
        suggestGenerateItinerary: false,
        readinessBlocked: true,
        blockedMessage: formatBookingSelectionBlockedMessage(),
      };
    }

    return {
      selectedFlightId: resolvedFlightId,
      selectedHotelId: resolvedHotelId,
      suggestGenerateItinerary: true,
      awaitingCanvasConfirmation: true,
      bookingsAlreadySelected: true,
    };
  },
});
