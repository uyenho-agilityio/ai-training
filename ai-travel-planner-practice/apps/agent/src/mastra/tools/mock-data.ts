import type { FlightSearchResult, HotelSearchResult } from "../config/types";

export const MOCK_FLIGHT_SEARCH_RESULTS: FlightSearchResult[] = [
  {
    id: "flight-1",
    airline: "SkyJet Airways",
    route: "ORG ➔ DST",
    price: "$320",
    time: "08:10 - 11:40",
  },
  {
    id: "flight-2",
    airline: "Pacific Wings",
    route: "ORG ➔ DST",
    price: "$285",
    time: "14:25 - 18:05",
  },
  {
    id: "flight-3",
    airline: "Global Air",
    route: "ORG ➔ DST",
    price: "$410",
    time: "06:45 - 10:20",
  },
  {
    id: "flight-4",
    airline: "SkyJet Airways",
    route: "ORG ➔ DST",
    price: "$298",
    time: "19:50 - 23:15",
  },
];

export const MOCK_HOTEL_SEARCH_RESULTS: HotelSearchResult[] = [
  {
    id: "hotel-1",
    name: "The Grand Metropolitan",
    rating: 4.7,
    price: "$220 / night",
  },
  {
    id: "hotel-2",
    name: "City Center Boutique Hotel",
    rating: 4.4,
    price: "$165 / night",
  },
  {
    id: "hotel-3",
    name: "Harbor View Inn",
    rating: 4.5,
    price: "$189 / night",
  },
  {
    id: "hotel-4",
    name: "Skyline Suites",
    rating: 4.6,
    price: "$245 / night",
  },
];

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
