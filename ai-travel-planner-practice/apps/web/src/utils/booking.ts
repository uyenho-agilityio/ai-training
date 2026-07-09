import {
  AGENT_STOPPED_PREFIX,
  BOOKING_PREREQUISITES_PREFIX,
  CANVAS_CONFIRM_PREFIX,
  CANVAS_DECLINED_PREFIX,
} from "@/constants";
import type { PlaceBrief, TripSketch } from "@/types";

export type AuthoritativeTripContext = {
  tripDays: number;
  destination: string;
  sketchTitle: string;
  sketch: TripSketch | null;
  places: PlaceBrief[];
};

export type BookingPrerequisiteField = "dates" | "departure city";

const TRAVEL_DATE_PATTERN: RegExp =
  /\b(\d{4}-\d{2}-\d{2})\b|(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:\s*[-–]\s*\d{1,2})?)|(\b\d{1,2}\s*[-–]\s*\d{1,2}\b)|(\bfrom\s+(?:\w+\s+)*\d{1,2}\b)/i;

const MONTH_PATTERN: string =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const FROM_DATE_PHRASE_PATTERN: RegExp = new RegExp(
  `\\bfrom\\s+(?:${MONTH_PATTERN}[a-z]*\\s+\\d{1,2}|\\d{4}-\\d{2}-\\d{2})`,
  "i",
);

const isMonthToken = (token: string): boolean =>
  new RegExp(`^${MONTH_PATTERN}$`, "i").test(token.trim());

const DEPARTURE_ORIGIN_EXPLICIT_PATTERN: RegExp =
  /\b(?:flying from|depart(?:ing)? from|leaving from)\s+\S+/i;

const DEPARTURE_FROM_CITY_PATTERN: RegExp =
  /\bfrom\s+(?!that\b|the\b|your\b|an?\s+interrupted\b)([A-Z]{3}\b|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i;

const BOOKING_SEARCH_INTENT_PATTERN: RegExp =
  /\b(?:book|search|find|get|show|look)\b.*\b(?:booking|bookings|flight|flights|hotel|hotels|accommodation|stay)\b|\b(?:flight|flights|hotel|hotels)\b.*\b(?:search|find|book)\b/i;

const FLIGHTS_BOOKING_INTENT_PATTERN: RegExp =
  /\b(?:flight|flights|airfare|ticket|fly|booking|bookings)\b/i;

/** Parse destination city from a sketch title such as "2-Day Trip in Singapore". */
export const extractDestinationFromSketch = (
  sketch: TripSketch | undefined,
): string => {
  const title: string = sketch?.title?.trim() ?? "";

  if (!title) {
    return "";
  }

  const tripInMatch: RegExpMatchArray | null = title.match(
    /\bin\s+([A-Za-z][A-Za-z\s]*?)(?:\s*$|\.)/i,
  );

  if (tripInMatch?.[1]) {
    return tripInMatch[1].trim();
  }

  const adventureMatch: RegExpMatchArray | null = title.match(
    /^\d+-Day\s+(.+?)\s+Adventure/i,
  );

  if (adventureMatch?.[1]) {
    return adventureMatch[1].trim();
  }

  const daysInMatch: RegExpMatchArray | null = title.match(
    /^\d+\s+Days?\s+in\s+(.+?)$/i,
  );

  if (daysInMatch?.[1]) {
    return daysInMatch[1].trim();
  }

  return "";
};

/** True when the user is asking to search or book flights/hotels. */
export const isBookingSearchChatIntent = (message: string): boolean =>
  BOOKING_SEARCH_INTENT_PATTERN.test(message.trim());

/** True when the message mentions travel dates. */
export const messageHasTravelDates = (message: string): boolean =>
  TRAVEL_DATE_PATTERN.test(message.trim());

/** True when the message mentions a departure city or airport. */
export const messageHasDepartureOrigin = (message: string): boolean => {
  const trimmed: string = message.trim();

  if (FROM_DATE_PHRASE_PATTERN.test(trimmed)) {
    return false;
  }

  if (DEPARTURE_ORIGIN_EXPLICIT_PATTERN.test(trimmed)) {
    const originToken: string | undefined = trimmed.match(
      /\b(?:flying from|depart(?:ing)? from|leaving from)\s+(\S+)/i,
    )?.[1];

    if (originToken && isMonthToken(originToken)) {
      return false;
    }

    return true;
  }

  const fromCityMatch: RegExpMatchArray | null = trimmed.match(
    DEPARTURE_FROM_CITY_PATTERN,
  );

  if (!fromCityMatch?.[1]) {
    return false;
  }

  return !isMonthToken(fromCityMatch[1]);
};

/** Bare city or IATA reply when the assistant asked only for departure city. */
const isBareDepartureCityReply = (message: string): boolean => {
  const trimmed: string = message.trim();

  if (!trimmed || isBookingSearchChatIntent(trimmed)) {
    return false;
  }

  if (
    messageHasTravelDates(trimmed) ||
    FROM_DATE_PHRASE_PATTERN.test(trimmed)
  ) {
    return false;
  }

  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    return true;
  }

  const firstToken: string = trimmed.split(/\s+/)[0] ?? "";

  if (isMonthToken(firstToken)) {
    return false;
  }

  return (
    /^[A-Za-z][A-Za-z\s'-]{0,60}$/.test(trimmed) &&
    trimmed.split(/\s+/).length <= 4
  );
};

/** True when a booking search needs flight origin (not hotels-only). */
export const bookingSearchNeedsFlights = (message: string): boolean =>
  FLIGHTS_BOOKING_INTENT_PATTERN.test(message.trim());

let bookingPrerequisitesPending: boolean = false;
let pendingBookingPrerequisiteFields: BookingPrerequisiteField[] = [];

/** Mark that the user asked to search bookings but still owes dates and/or origin. */
export const markBookingPrerequisitesPending = (
  missing: BookingPrerequisiteField[],
): void => {
  bookingPrerequisitesPending = true;
  pendingBookingPrerequisiteFields = [...missing];
};

/** Clear pending booking prerequisites after the user supplies required details. */
export const clearBookingPrerequisitesPending = (): void => {
  bookingPrerequisitesPending = false;
  pendingBookingPrerequisiteFields = [];
};

/** True while waiting for the user's booking dates and/or departure city reply. */
export const isBookingPrerequisitesPending = (): boolean =>
  bookingPrerequisitesPending;

const isHiddenAgentUserMessage = (text: string): boolean => {
  const trimmed: string = text.trim();

  return (
    trimmed.startsWith(AGENT_STOPPED_PREFIX) ||
    trimmed.startsWith(BOOKING_PREREQUISITES_PREFIX) ||
    trimmed.startsWith(CANVAS_CONFIRM_PREFIX) ||
    trimmed.startsWith(CANVAS_DECLINED_PREFIX)
  );
};

const collectRecentUserTexts = (
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): string[] =>
  messages
    .filter((message) => message.role === "user")
    .map((message) =>
      typeof message.content === "string" ? message.content.trim() : "",
    )
    .filter(
      (text: string): boolean =>
        text.length > 0 && !isHiddenAgentUserMessage(text),
    )
    .slice(-5);

const conversationHasTravelDates = (
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): boolean => collectRecentUserTexts(messages).some(messageHasTravelDates);

const conversationHasDepartureOrigin = (
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): boolean => collectRecentUserTexts(messages).some(messageHasDepartureOrigin);

/** Missing prerequisites before a booking search can run. */
export const getBookingSearchMissingPrerequisites = (
  message: string,
  agentMessages: ReadonlyArray<{ role?: string; content?: unknown }>,
): BookingPrerequisiteField[] => {
  const trimmed: string = message.trim();
  const missing: BookingPrerequisiteField[] = [];

  if (!isBookingSearchChatIntent(trimmed)) {
    return missing;
  }

  const hasDates: boolean =
    messageHasTravelDates(trimmed) || conversationHasTravelDates(agentMessages);

  if (!hasDates) {
    missing.push("dates");
  }

  if (bookingSearchNeedsFlights(trimmed)) {
    const hasOrigin: boolean =
      messageHasDepartureOrigin(trimmed) ||
      conversationHasDepartureOrigin(agentMessages);

    if (!hasOrigin) {
      missing.push("departure city");
    }
  }

  return missing;
};

/** Missing prerequisites on a follow-up reply after the booking gate prompt. */
export const getFollowUpBookingMissingPrerequisites = (
  message: string,
  agentMessages: ReadonlyArray<{ role?: string; content?: unknown }>,
): BookingPrerequisiteField[] => {
  const missing: BookingPrerequisiteField[] = [];
  const trimmed: string = message.trim();

  if (pendingBookingPrerequisiteFields.includes("dates")) {
    const hasDates: boolean =
      messageHasTravelDates(trimmed) ||
      conversationHasTravelDates(agentMessages);

    if (!hasDates) {
      missing.push("dates");
    }
  }

  if (pendingBookingPrerequisiteFields.includes("departure city")) {
    const hasOrigin: boolean =
      messageHasDepartureOrigin(trimmed) ||
      conversationHasDepartureOrigin(agentMessages) ||
      isBareDepartureCityReply(trimmed);

    if (!hasOrigin) {
      missing.push("departure city");
    }
  }

  return missing;
};

/** Hidden user message after stop — tells the agent to trust canvas trip length/destination. */
export const buildAgentStoppedMessage = (
  context: Pick<AuthoritativeTripContext, "tripDays" | "destination">,
): string => {
  const destination: string = context.destination || "the canvas destination";
  const tripDays: number = context.tripDays;

  return `${AGENT_STOPPED_PREFIX}User stopped the agent. The previous run was interrupted — ignore any trip length or destination changes proposed during the interrupted turn (including chat proposals not committed on the canvas). Authoritative canvas state: ${tripDays} day(s) in ${destination}. Use sketch.days.length=${tripDays} for trip length and ${destination} for destination in summaries and booking searches.`;
};

/** User-visible assistant prompt when booking search is missing prerequisites. */
export const buildBookingPrerequisitesUserPrompt = (
  missing: BookingPrerequisiteField[],
  destination: string,
): string => {
  const place: string = destination || "your trip";

  if (missing.includes("dates") && missing.includes("departure city")) {
    return `What are your check-in and check-out dates for ${place}? And which city will you be flying from?`;
  }

  if (missing.includes("dates")) {
    return `What are your check-in and check-out dates for ${place}?`;
  }

  return `Which city will you be flying from for ${place}?`;
};

/** True for hidden stop markers that should not render in chat. */
export const isHiddenAgentStoppedChatMessage = (text: string): boolean =>
  text.trim().startsWith(AGENT_STOPPED_PREFIX);

/** True for hidden booking prerequisite gate messages. */
export const isHiddenBookingPrerequisitesChatMessage = (
  text: string,
): boolean => text.trim().startsWith(BOOKING_PREREQUISITES_PREFIX);
