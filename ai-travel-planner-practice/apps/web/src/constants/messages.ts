export const BOOK_EMPTY_FLIGHTS_MESSAGE: string =
  "No flights yet. Ask the agent to search flights for your trip.";

export const BOOK_EMPTY_HOTELS_MESSAGE: string =
  "No hotels yet. Ask the agent to search hotels for your destination.";

export const GENERATE_ITINERARY_CONFIRM_MESSAGE: string =
  "Generate a full day-by-day itinerary on the canvas? The AI will build it here — you stay in control and can change anything after.";

export const GENERATE_FULL_ITINERARY_MESSAGE: string =
  "Generate my full itinerary on the canvas.";

export const CANVAS_CONFIRM_PREFIX: string = "__canvas_confirm__:";

export const CANVAS_DECLINED_PREFIX: string = "__canvas_declined__:";

/** User messages shown in chat but excluded from agent context (e.g. intercepted make-it-real). */
export const CANVAS_CHAT_ONLY_PREFIX: string = "__canvas_chat_only__:";

/** Hidden user message after the user stops an in-flight agent run. */
export const AGENT_STOPPED_PREFIX: string = "__agent_stopped__:";

/** Hidden gate message when booking search lacks dates or departure city. */
export const BOOKING_PREREQUISITES_PREFIX: string =
  "__booking_prerequisites__:";

export const SKETCH_FROM_STARRED_USER_MESSAGE: string =
  "Sketch from my starred places on the canvas.";

export const PLANNING_IN_PROGRESS_MESSAGE: string =
  "Places are on the canvas — the agent is still building your day-by-day sketch.";

export const SKETCH_READY_ON_PLACES_MESSAGE: string =
  "Your itinerary sketch is ready — open the Itinerary tab to review it. Places stay here.";
