import { createTool } from "@mastra/core/tools";

import {
  filterSketchToStarredPlaces,
  dedupeSketchStopNames,
  ensureAllStarredInSketch,
  normalizeTripSketch,
} from "../config/utils";
import { tripSketchInputSchema, tripSketchOutputSchema } from "../schemas";

export const tripSketchTool = createTool({
  id: "trip-sketch",
  description:
    "Build or refresh the Itinerary sketch on the canvas: title, at-a-glance summary, ordered day-by-day route stops, and local tips. Call after the user has place ideas or starred favorites and wants a schedule. Pass the complete sketch object; no external API is used.",
  inputSchema: tripSketchInputSchema,
  outputSchema: tripSketchOutputSchema,
  execute: async (inputData) => {
    const destination: string = inputData.destination.trim();
    const tripDays: number = inputData.tripDays ?? inputData.sketch.days.length;

    let sketch = inputData.sketch;

    sketch = dedupeSketchStopNames(sketch);

    if (inputData.starredPlaceTitles?.length) {
      sketch = filterSketchToStarredPlaces(
        sketch,
        inputData.starredPlaceTitles,
        inputData.places,
      );
      sketch = dedupeSketchStopNames(sketch);
      sketch = ensureAllStarredInSketch(
        sketch,
        inputData.starredPlaceTitles,
        tripDays,
        inputData.places,
      );
    }

    sketch = normalizeTripSketch(sketch, inputData.places, tripDays);

    return {
      destination,
      sketch,
    };
  },
});
