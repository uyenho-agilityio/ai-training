import { createTool } from "@mastra/core/tools";

import { normalizePlaces } from "../config/utils";
import { checkPlacesInputSchema, checkPlacesOutputSchema } from "../schemas";

export const checkPlacesTool = createTool({
  id: "check-places",
  description:
    "Populate the Places tab with structured destination suggestions. Call when the user wants ideas, spots, activities, or what to see — before building a day-by-day sketch. Pass the full places array you recommend; no external API is used.",
  inputSchema: checkPlacesInputSchema,
  outputSchema: checkPlacesOutputSchema,
  execute: async (inputData) => {
    const destination = inputData.destination.trim();
    const places = normalizePlaces(inputData.places);

    return {
      destination,
      appendToExisting: inputData.appendToExisting === true,
      places,
    };
  },
});
