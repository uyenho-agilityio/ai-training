import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  fetchSerpApi,
  formatSerpApiPrice,
  hasSerpApiKey,
} from "../config/utils";
import type {
  HotelSearchResult,
  SerpApiHotelProperty,
  SerpApiHotelsResponse,
} from "../config/types";
import { MAX_RESULTS } from "../config/constants";
import { buildMockHotelsResult } from "./mock-data";

const hotelResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  price: z.string(),
});

type HotelSearchInput = {
  location: string;
  checkIn: string;
  checkOut: string;
  adults?: number | null;
  currency?: string | null;
};

type HotelSearchOutput = {
  hotels: HotelSearchResult[];
  location: string;
  checkIn: string;
  checkOut: string;
};

const normalizeHotelLocation = (location: string): string => {
  const trimmed = location.trim();
  const primary = trimmed.split(",")[0]?.trim();

  return primary && primary.length > 0 ? primary : trimmed;
};

const buildHotelSearchQuery = (location: string): string => {
  const city = normalizeHotelLocation(location);
  const lower = city.toLowerCase();

  if (lower.includes("hotel")) {
    return city;
  }

  return `${city} hotels`;
};

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const normalizeStayDates = (
  checkIn: string,
  checkOut: string,
): { checkIn: string; checkOut: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedCheckIn = new Date(checkIn);
  const parsedCheckOut = new Date(checkOut);
  const checkInValid =
    !Number.isNaN(parsedCheckIn.getTime()) && parsedCheckIn >= today;
  const checkOutValid =
    !Number.isNaN(parsedCheckOut.getTime()) && parsedCheckOut > parsedCheckIn;

  if (checkInValid && checkOutValid) {
    return { checkIn, checkOut };
  }

  const fallbackCheckIn = new Date(today);
  fallbackCheckIn.setDate(fallbackCheckIn.getDate() + 30);

  const fallbackCheckOut = new Date(fallbackCheckIn);
  fallbackCheckOut.setDate(fallbackCheckOut.getDate() + 3);

  console.warn("[search-hotels] Adjusted invalid or past stay dates", {
    checkIn,
    checkOut,
    fallbackCheckIn: formatDateOnly(fallbackCheckIn),
    fallbackCheckOut: formatDateOnly(fallbackCheckOut),
  });

  return {
    checkIn: formatDateOnly(fallbackCheckIn),
    checkOut: formatDateOnly(fallbackCheckOut),
  };
};

const mapHotelProperty = (
  property: SerpApiHotelProperty,
  index: number,
  currency: string,
): HotelSearchResult => {
  const nightlyRate =
    property.rate_per_night?.extracted_lowest ??
    property.total_rate?.extracted_lowest;
  const nightlyLabel =
    property.rate_per_night?.lowest ?? property.total_rate?.lowest;

  const price =
    nightlyRate !== undefined
      ? `${formatSerpApiPrice(nightlyRate, currency)} / night`
      : nightlyLabel
        ? `${nightlyLabel} / night`
        : "Price unavailable";

  return {
    id: property.property_token ?? `hotel-${index + 1}`,
    name: property.name?.trim() || `Hotel ${index + 1}`,
    rating: Math.round((property.overall_rating ?? 0) * 10) / 10,
    price,
  };
};

const extractHotelProperties = (
  data: SerpApiHotelsResponse,
): SerpApiHotelProperty[] => {
  if (data.properties && data.properties.length > 0) {
    return data.properties;
  }

  if (data.property) {
    return [data.property];
  }

  return [];
};

const searchHotels = async (
  input: HotelSearchInput,
): Promise<HotelSearchOutput> => {
  const normalizedLocation = normalizeHotelLocation(input.location);
  const { checkIn, checkOut } = normalizeStayDates(
    input.checkIn,
    input.checkOut,
  );
  const normalizedInput = {
    location: normalizedLocation,
    checkIn,
    checkOut,
    adults: input.adults ?? undefined,
    currency: input.currency ?? undefined,
  };

  if (!hasSerpApiKey()) {
    console.warn("[search-hotels] No SERPAPI_API_KEY — returning mock data");
    return buildMockHotelsResult(normalizedInput);
  }

  try {
    return await searchHotelsViaSerpApi(normalizedInput);
  } catch (error) {
    console.warn(
      "[search-hotels] SerpAPI failed — returning empty results",
      error,
    );

    return {
      hotels: [],
      location: normalizedInput.location,
      checkIn: normalizedInput.checkIn,
      checkOut: normalizedInput.checkOut,
    };
  }
};

const searchHotelsViaSerpApi = async (input: {
  location: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  currency?: string;
}): Promise<HotelSearchOutput> => {
  const currency = input.currency ?? "USD";
  const adults = input.adults ?? 2;
  const query = buildHotelSearchQuery(input.location);

  const data = await fetchSerpApi<SerpApiHotelsResponse>({
    engine: "google_hotels",
    q: query,
    check_in_date: input.checkIn,
    check_out_date: input.checkOut,
    adults,
    currency,
    hl: "en",
  });

  const responseCurrency = data.search_parameters?.currency ?? currency;
  const hotels = extractHotelProperties(data)
    .slice(0, MAX_RESULTS)
    .map((property, index) =>
      mapHotelProperty(property, index, responseCurrency),
    );

  if (!hotels?.length) {
    throw new Error(
      `No hotels found near ${input.location} for ${input.checkIn} to ${input.checkOut}`,
    );
  }

  return {
    hotels,
    location: input.location,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  };
};

export const searchHotelsTool = createTool({
  id: "search-hotels",
  description:
    "ONLY for hotels-only requests. Call when the user wants hotels/accommodation/stays and does NOT also ask for flights. Do not ask for flight origin. Never use for flights-only or combined flights+hotels requests. Uses Google Hotels via SerpAPI.",
  inputSchema: z.object({
    location: z
      .string()
      .describe(
        "City to search — use a simple English city name (e.g. Tokyo, Da Nang), not a neighborhood or full address",
      ),
    checkIn: z
      .string()
      .describe(
        "Check-in date in YYYY-MM-DD (infer year from current date when user omits it)",
      ),
    checkOut: z
      .string()
      .describe(
        "Check-out date in YYYY-MM-DD (infer year from current date when user omits it)",
      ),
    adults: z
      .number()
      .int()
      .min(1)
      .max(9)
      .nullish()
      .describe("Number of adult guests (default 2)"),
    currency: z
      .string()
      .nullish()
      .describe(
        "ISO 4217 currency for prices at the destination (e.g. EUR for France, VND for Vietnam, JPY for Japan). Infer from the city/country; default USD if unsure.",
      ),
  }),
  outputSchema: z.object({
    hotels: z.array(hotelResultSchema),
    location: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
  }),
  execute: async (inputData) => searchHotels(inputData),
});

export { searchHotels as runHotelSearch };
