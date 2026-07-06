export const CANVAS_CONFIRM_PREFIX = "__canvas_confirm__:";

export const CANVAS_DECLINED_PREFIX = "__canvas_declined__:";

export const GENERATE_FULL_ITINERARY_MESSAGE =
  "Generate my full itinerary on the canvas.";

export const GENERATE_ITINERARY_BLOCKED_ERROR =
  "Canvas confirmation required. Call selectBookingsTool with suggestGenerateItinerary:true and canvasReadiness first, then wait for the user to confirm on the canvas modal. Do not call generateItineraryTool until the user sends the post-confirmation message.";

type AgentMessageLike = {
  role?: string;
  content?: unknown;
};

/** Strip hidden chat prefix and optional booking-id suffix before checking confirm text. */
export const normalizeCanvasConfirmMessage = (text: string): string => {
  let trimmed: string = text.trim();

  if (trimmed.startsWith(CANVAS_CONFIRM_PREFIX)) {
    trimmed = trimmed.slice(CANVAS_CONFIRM_PREFIX.length).trim();
  }

  const bookingMarker: number = trimmed.indexOf("::");

  if (bookingMarker !== -1) {
    trimmed = trimmed.slice(0, bookingMarker).trim();
  }

  return trimmed;
};

/** Booking ids embedded in a hidden canvas confirm message (`::flightId::hotelId::` suffix). */
export const parseCanvasConfirmBookingIds = (
  text: string,
): { flightId: string | null; hotelId: string | null } => {
  const trimmed: string = text.trim();
  const payload: string = trimmed.startsWith(CANVAS_CONFIRM_PREFIX)
    ? trimmed.slice(CANVAS_CONFIRM_PREFIX.length)
    : trimmed;
  const match: RegExpMatchArray | null = payload.match(/::([^:]+)::([^:]+)::/);

  if (!match) {
    return { flightId: null, hotelId: null };
  }

  return { flightId: match[1], hotelId: match[2] };
};

/** True when the user message is the synthetic post-modal confirmation trigger. */
export const isCanvasItineraryConfirmMessage = (text: string): boolean =>
  normalizeCanvasConfirmMessage(text) === GENERATE_FULL_ITINERARY_MESSAGE;

/** True when the user canceled the canvas generate-itinerary modal. */
export const isCanvasItineraryDeclinedMessage = (text: string): boolean =>
  text.trim().startsWith(CANVAS_DECLINED_PREFIX);

const extractMessageText = (content: unknown): string => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .filter(
      (part: unknown): part is { type: string; text: string } =>
        typeof part === "object" &&
        part !== null &&
        "type" in part &&
        (part as { type: string }).type === "text" &&
        "text" in part &&
        typeof (part as { text: string }).text === "string",
    )
    .map((part: { text: string }) => part.text.trim())
    .filter(Boolean)
    .join("\n");
};

/** Latest user turn text from the agent message list passed into tool execution. */
export const getLatestUserMessageText = (
  messages: AgentMessageLike[],
): string | null => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    const text = extractMessageText(message.content);

    if (text) {
      return text;
    }
  }

  return null;
};
