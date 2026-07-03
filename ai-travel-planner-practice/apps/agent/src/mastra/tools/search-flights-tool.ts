import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  fetchSerpApi,
  formatSerpApiPrice,
  formatSerpApiTime,
  hasSerpApiKey,
} from "../config/utils";
import type {
  FlightSearchResult,
  SerpApiFlightOption,
  SerpApiFlightsResponse,
} from "../config/types";
import { MAX_RESULTS } from "../config/constants";
import { buildMockFlightsResult } from "./mock-data";

const flightResultSchema = z.object({
  id: z.string(),
  airline: z.string(),
  route: z.string(),
  price: z.string(),
  time: z.string(),
});

const getFlightAirlineLabel = (option: SerpApiFlightOption): string => {
  const airlines = [
    ...new Set(option.flights.map((segment) => segment.airline)),
  ];

  if (airlines.length === 0) {
    return "Unknown airline";
  }

  if (airlines.length === 1) {
    return airlines[0] ?? "Unknown airline";
  }

  return `${airlines[0]} +${airlines.length - 1}`;
};

const mapFlightOption = (
  option: SerpApiFlightOption,
  index: number,
  currency: string,
): FlightSearchResult | null => {
  const firstSegment = option.flights[0];
  const lastSegment = option.flights[option.flights.length - 1];

  if (!firstSegment || !lastSegment) {
    return null;
  }

  return {
    id: `flight-${index + 1}`,
    airline: getFlightAirlineLabel(option),
    route: `${firstSegment.departure_airport.id} ➔ ${lastSegment.arrival_airport.id}`,
    price: formatSerpApiPrice(option.price, currency),
    time: `${formatSerpApiTime(firstSegment.departure_airport.time)} - ${formatSerpApiTime(lastSegment.arrival_airport.time)}`,
  };
};

const searchFlights = async (input: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults?: number | null;
  currency?: string | null;
}): Promise<{
  flights: FlightSearchResult[];
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}> => {
  const normalizedInput = {
    origin: input.origin,
    destination: input.destination,
    departureDate: input.departureDate,
    returnDate: input.returnDate ?? undefined,
    adults: input.adults ?? undefined,
    currency: input.currency ?? undefined,
  };

  if (!hasSerpApiKey()) {
    console.warn("[search-flights] No SERPAPI_API_KEY — returning mock data");
    return buildMockFlightsResult(normalizedInput);
  }

  try {
    return await searchFlightsViaSerpApi(normalizedInput);
  } catch (error) {
    console.warn(
      "[search-flights] SerpAPI failed — returning mock data",
      error,
    );

    return buildMockFlightsResult(normalizedInput);
  }
};

const searchFlightsViaSerpApi = async (input: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
}): Promise<{
  flights: FlightSearchResult[];
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}> => {
  const currency = input.currency ?? "USD";
  const adults = input.adults ?? 1;
  const isRoundTrip = Boolean(input.returnDate);

  const params: Record<string, string | number> = {
    engine: "google_flights",
    departure_id: input.origin.toUpperCase(),
    arrival_id: input.destination.toUpperCase(),
    outbound_date: input.departureDate,
    type: isRoundTrip ? 1 : 2,
    adults,
    currency,
    hl: "en",
  };

  if (input.returnDate) {
    params.return_date = input.returnDate;
  }

  const data = await fetchSerpApi<SerpApiFlightsResponse>(params);
  const responseCurrency = data.search_parameters?.currency ?? currency;
  const rawOptions = [
    ...(data.best_flights ?? []),
    ...(data.other_flights ?? []),
  ];

  const flights = rawOptions
    .slice(0, MAX_RESULTS)
    .map((option, index) => mapFlightOption(option, index, responseCurrency))
    .filter((flight): flight is FlightSearchResult => flight !== null);

  if (!flights?.length) {
    throw new Error(
      `No flights found for ${input.origin} to ${input.destination} on ${input.departureDate}`,
    );
  }

  return {
    flights,
    origin: input.origin.toUpperCase(),
    destination: input.destination.toUpperCase(),
    departureDate: input.departureDate,
    returnDate: input.returnDate,
  };
};

export const searchFlightsTool = createTool({
  id: "search-flights",
  description:
    "ONLY for flights-only requests. Call when the user wants flights/airfare/tickets and does NOT also ask for hotels. Never use for hotels-only or combined flights+hotels requests. Uses Google Flights via SerpAPI.",
  inputSchema: z.object({
    origin: z
      .string()
      .describe(
        "Departure airport IATA code (e.g. SGN) or Google Flights location id",
      ),
    destination: z
      .string()
      .describe(
        "Arrival airport IATA code (e.g. DAD) or Google Flights location id",
      ),
    departureDate: z
      .string()
      .describe(
        "Outbound travel date in YYYY-MM-DD (infer year from current date when user omits it)",
      ),
    returnDate: z
      .string()
      .nullish()
      .describe("Return date in YYYY-MM-DD format for round-trip searches"),
    adults: z
      .number()
      .int()
      .min(1)
      .max(9)
      .nullish()
      .describe("Number of adult travelers (default 1)"),
    currency: z
      .string()
      .nullish()
      .describe(
        "ISO 4217 currency for prices. Infer from origin/destination countries; default USD if unsure.",
      ),
  }),
  outputSchema: z.object({
    flights: z.array(flightResultSchema),
    origin: z.string(),
    destination: z.string(),
    departureDate: z.string(),
    returnDate: z.string().optional(),
  }),
  execute: async (inputData) => {
    return await searchFlights(inputData);
  },
});

export { searchFlights as runFlightSearch };
