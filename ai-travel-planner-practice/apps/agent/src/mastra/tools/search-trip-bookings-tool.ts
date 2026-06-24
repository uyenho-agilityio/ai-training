import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { runFlightSearch } from "./search-flights-tool";
import { runHotelSearch } from "./search-hotels-tool";

const bookingItemSchema = z.object({
  id: z.string(),
});

const flightResultSchema = bookingItemSchema.extend({
  airline: z.string(),
  route: z.string(),
  price: z.string(),
  time: z.string(),
});

const hotelResultSchema = bookingItemSchema.extend({
  name: z.string(),
  rating: z.number(),
  price: z.string(),
});

/** Search flights and hotels together — use when the user asks for both in one message. */
export const searchTripBookingsTool = createTool({
  id: "search-trip-bookings",
  description:
    "ONLY when the user explicitly wants flights AND hotels together in one request. Never use for hotels-only or flights-only. Returns both sections on the Book tab; empty arrays when a search finds nothing.",
  inputSchema: z.object({
    origin: z.string().describe("Departure airport IATA code (e.g. SGN)"),
    destination: z.string().describe("Arrival airport IATA code (e.g. DAD)"),
    departureDate: z
      .string()
      .describe(
        "Outbound flight date in YYYY-MM-DD — infer year when user omits it; use check-in date when user gives one date range",
      ),
    hotelLocation: z
      .string()
      .nullish()
      .describe(
        "Hotel city name in English (e.g. Da Nang) — never an airport code. Defaults to destination city when omitted",
      ),
    checkIn: z
      .string()
      .describe(
        "Hotel check-in date in YYYY-MM-DD (infer year when user omits it)",
      ),
    checkOut: z
      .string()
      .describe(
        "Hotel check-out date in YYYY-MM-DD (infer year when user omits it)",
      ),
    returnDate: z
      .string()
      .nullish()
      .describe("Return flight date in YYYY-MM-DD for round-trip"),
    adults: z
      .number()
      .int()
      .min(1)
      .max(9)
      .nullish()
      .describe("Number of adult travelers (default 2)"),
    currency: z
      .string()
      .nullish()
      .describe(
        "ISO 4217 currency for prices at the destination. Infer from cities/countries in the request; default USD if unsure.",
      ),
  }),
  outputSchema: z.object({
    flights: z.array(flightResultSchema),
    hotels: z.array(hotelResultSchema),
    origin: z.string(),
    destination: z.string(),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    location: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
  }),
  execute: async (inputData) => {
    const hotelLocation =
      inputData.hotelLocation?.trim() || inputData.destination;
    const currency = inputData.currency ?? "USD";
    const adults = inputData.adults ?? 2;

    const [flightResult, hotelResult] = await Promise.all([
      runFlightSearch({
        origin: inputData.origin,
        destination: inputData.destination,
        departureDate: inputData.departureDate,
        returnDate: inputData.returnDate,
        adults,
        currency,
      }),
      runHotelSearch({
        location: hotelLocation,
        checkIn: inputData.checkIn,
        checkOut: inputData.checkOut,
        adults,
        currency,
      }),
    ]);

    return {
      flights: flightResult.flights,
      hotels: hotelResult.hotels,
      origin: flightResult.origin,
      destination: flightResult.destination,
      departureDate: flightResult.departureDate,
      returnDate: flightResult.returnDate,
      location: hotelResult.location,
      checkIn: hotelResult.checkIn,
      checkOut: hotelResult.checkOut,
    };
  },
});
