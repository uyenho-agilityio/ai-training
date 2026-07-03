import { createTool } from "@mastra/core/tools";

import { normalizeFullItinerary } from "../config/itinerary";
import {
  generateItineraryInputSchema,
  generateItineraryOutputSchema,
} from "../schemas";

export const generateItineraryTool = createTool({
  id: "generate-itinerary",
  description:
    "Build the full day-by-day itinerary on the canvas from the trip sketch plus selected flight and hotel. Each day has timed segments with activity and optional logistics. Call only after the canvas Confirmation modal sends the user message that starts with: Generate my full itinerary on the canvas (Let's make it real). For ordinary chat requests to make a full itinerary, call selectBookingsTool with suggestGenerateItinerary: true first.",
  inputSchema: generateItineraryInputSchema,
  outputSchema: generateItineraryOutputSchema,
  execute: async (inputData) => {
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
