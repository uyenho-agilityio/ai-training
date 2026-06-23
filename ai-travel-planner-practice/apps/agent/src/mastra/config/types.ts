export type LlmModelId = string;

export type SerpApiAirport = {
  name: string;
  id: string;
  time: string;
};

export type SerpApiFlightSegment = {
  departure_airport: SerpApiAirport;
  arrival_airport: SerpApiAirport;
  airline: string;
};

export type SerpApiFlightOption = {
  flights: SerpApiFlightSegment[];
  price: number;
  type?: string;
};

export type SerpApiFlightsResponse = {
  best_flights?: SerpApiFlightOption[];
  other_flights?: SerpApiFlightOption[];
  search_parameters?: {
    currency?: string;
  };
};

export type SerpApiHotelProperty = {
  name: string;
  property_token?: string;
  overall_rating?: number;
  rate_per_night?: {
    lowest?: string;
    extracted_lowest?: number;
  };
  total_rate?: {
    lowest?: string;
    extracted_lowest?: number;
  };
};

export type SerpApiHotelsResponse = {
  properties?: SerpApiHotelProperty[];
  search_parameters?: {
    currency?: string;
  };
};

export type FlightSearchResult = {
  id: string;
  airline: string;
  route: string;
  price: string;
  time: string;
};

export type HotelSearchResult = {
  id: string;
  name: string;
  rating: number;
  price: string;
};
