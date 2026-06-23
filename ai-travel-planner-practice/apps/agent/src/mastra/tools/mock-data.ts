import type { FlightSearchResult, HotelSearchResult } from "../config/types";

export const MOCK_FLIGHT_SEARCH_RESULTS: FlightSearchResult[] = [
  {
    id: "flight-1",
    airline: "Vietjet",
    route: "DAD ➔ SGN",
    price: "₫2,225,200",
    time: "21:50 - 23:15",
  },
  {
    id: "flight-2",
    airline: "Bamboo Airways",
    route: "DAD ➔ SGN",
    price: "₫2,376,000",
    time: "08:10 - 09:40",
  },
  {
    id: "flight-3",
    airline: "Vietnam Airlines",
    route: "DAD ➔ SGN",
    price: "₫2,454,000",
    time: "05:45 - 07:20",
  },
  {
    id: "flight-4",
    airline: "Vietjet",
    route: "DAD ➔ SGN",
    price: "₫2,225,200",
    time: "05:35 - 07:00",
  },
];

/** Frozen SerpAPI-shaped hotel results (HCMC) for offline / quota fallback. */
export const MOCK_HOTEL_SEARCH_RESULTS: HotelSearchResult[] = [
  {
    id: "hotel-1",
    name: "La Siesta Premium Saigon",
    rating: 4.9,
    price: "₫4,265,106 / night",
  },
  {
    id: "hotel-2",
    name: "La Vela Saigon Hotel",
    rating: 4.2,
    price: "₫2,576,985 / night",
  },
  {
    id: "hotel-3",
    name: "Oakwood Hotel & Apartments Saigon",
    rating: 4.5,
    price: "₫2,008,971 / night",
  },
  {
    id: "hotel-4",
    name: "Mai House Saigon Hotel",
    rating: 4.8,
    price: "₫3,850,001 / night",
  },
];

/** Build a flight tool response using mock rows but caller-supplied search metadata. */
export const buildMockFlightsResult = (input: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}) => ({
  flights: MOCK_FLIGHT_SEARCH_RESULTS.map((flight) => ({
    ...flight,
    route: `${input.origin.toUpperCase()} ➔ ${input.destination.toUpperCase()}`,
  })),
  origin: input.origin.toUpperCase(),
  destination: input.destination.toUpperCase(),
  departureDate: input.departureDate,
  returnDate: input.returnDate,
});

/** Build a hotel tool response using mock rows but caller-supplied stay metadata. */
export const buildMockHotelsResult = (input: {
  location: string;
  checkIn: string;
  checkOut: string;
}) => ({
  hotels: MOCK_HOTEL_SEARCH_RESULTS,
  location: input.location,
  checkIn: input.checkIn,
  checkOut: input.checkOut,
});
