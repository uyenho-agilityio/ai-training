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
    name: property.name,
    rating: Math.round((property.overall_rating ?? 0) * 10) / 10,
    price,
  };
};

const searchHotels = async (input: {
  location: string;
  checkIn: string;
  checkOut: string;
  adults?: number | null;
  currency?: string | null;
}): Promise<{
  hotels: HotelSearchResult[];
  location: string;
  checkIn: string;
  checkOut: string;
}> => {
  const normalizedInput = {
    location: input.location,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
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
    console.warn("[search-hotels] SerpAPI failed — returning mock data", error);
    return buildMockHotelsResult(normalizedInput);
  }
};

const searchHotelsViaSerpApi = async (input: {
  location: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  currency?: string;
}): Promise<{
  hotels: HotelSearchResult[];
  location: string;
  checkIn: string;
  checkOut: string;
}> => {
  const currency = input.currency ?? "USD";
  const adults = input.adults ?? 2;
  const query = input.location.toLowerCase().includes("hotel")
    ? input.location
    : `${input.location} hotels`;

  const data = await fetchSerpApi<SerpApiHotelsResponse>({
    engine: "google_hotels",
    q: query,
    check_in_date: input.checkIn,
    check_out_date: input.checkOut,
    adults,
    currency,
    hl: "en",
    gl: "us",
  });

  const responseCurrency = data.search_parameters?.currency ?? currency;
  const hotels = (data.properties ?? [])
    .slice(0, MAX_RESULTS)
    .map((property, index) =>
      mapHotelProperty(property, index, responseCurrency),
    );

  if (hotels.length === 0) {
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
    "REQUIRED for live hotel searches. Call this tool whenever the user wants real hotel options. Never list hotel names, ratings, or prices without calling this tool first. Uses Google Hotels via SerpAPI.",
  inputSchema: z.object({
    location: z
      .string()
      .describe("City or area to search (e.g. Da Nang, Bali Resorts)"),
    checkIn: z.string().describe("Check-in date in YYYY-MM-DD format"),
    checkOut: z.string().describe("Check-out date in YYYY-MM-DD format"),
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
      .describe("ISO currency code for prices (default USD)"),
  }),
  outputSchema: z.object({
    hotels: z.array(hotelResultSchema),
    location: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
  }),
  execute: async (inputData) => {
    return await searchHotels(inputData);
  },
});
