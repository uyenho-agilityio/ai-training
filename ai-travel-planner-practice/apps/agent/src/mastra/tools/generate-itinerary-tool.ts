import { createTool } from "@mastra/core/tools";

import {
  GENERATE_ITINERARY_BLOCKED_ERROR,
  getLatestUserMessageText,
  isCanvasItineraryConfirmMessage,
} from "../config/generate-itinerary-gate";
import { normalizeFullItinerary } from "../config/itinerary";
import {
  generateItineraryInputSchema,
  generateItineraryOutputSchema,
} from "../schemas";

export const generateItineraryTool = createTool({
  id: "generate-itinerary",
  description:
    "Build the full day-by-day itinerary on the canvas from the trip sketch plus selected flight and hotel. Call ONLY after the canvas Confirmation modal is confirmed. For ordinary chat requests to make/generate a full itinerary, call selectBookingsTool with suggestGenerateItinerary: true first and wait for canvas confirmation — never call this tool in that turn.",
  inputSchema: generateItineraryInputSchema,
  outputSchema: generateItineraryOutputSchema,
  execute: async (inputData, context) => {
    const latestUserMessage: string | null = getLatestUserMessageText(
      context?.agent?.messages ?? [],
    );

    if (
      !latestUserMessage ||
      !isCanvasItineraryConfirmMessage(latestUserMessage)
    ) {
      throw new Error(GENERATE_ITINERARY_BLOCKED_ERROR);
    }

    const destination: string = inputData.destination.trim();
    const itinerary = normalizeFullItinerary(
      inputData.itinerary,
      inputData.sketch,
      inputData.starredPlaceTitles,
    );

    return {
      destination,
      itinerary,
    };
  },
});
