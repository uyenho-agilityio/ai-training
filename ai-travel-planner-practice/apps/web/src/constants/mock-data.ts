import type {
  FlightData,
  FlightsToolResult,
  FullItineraryDay,
  HotelData,
  HotelsToolResult,
  PlaceBrief,
  TripSketch,
} from "@/types";

export const MOCK_WEATHER_TOOL_DATA_RESULT =
  '{"temperature":34.4,"feelsLike":40.4,"humidity":57,"windSpeed":11.5,"windGust":30.2,"conditions":"Thunderstorm","location":"Da Nang"}';

export const MOCK_FLIGHTS_TOOL_DATA_RESULT = JSON.stringify({
  flights: [
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
  ],
  origin: "DAD",
  destination: "SGN",
  departureDate: "2026-07-01",
} satisfies FlightsToolResult);

export const MOCK_HOTELS_TOOL_DATA_RESULT = JSON.stringify({
  hotels: [
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
  ],
  location: "Ho Chi Minh City",
  checkIn: "2026-07-01",
  checkOut: "2026-07-04",
} satisfies HotelsToolResult);

/** Book tab flights — derived from tool result for Phase 4 parity. */
export const MOCK_FLIGHTS: FlightData[] = (
  JSON.parse(MOCK_FLIGHTS_TOOL_DATA_RESULT) as FlightsToolResult
).flights;

/** Book tab hotels — derived from tool result for Phase 4 parity. */
export const MOCK_HOTELS: HotelData[] = (
  JSON.parse(MOCK_HOTELS_TOOL_DATA_RESULT) as HotelsToolResult
).hotels;

export const MOCK_PLACES: PlaceBrief[] = [
  {
    id: "p1",
    title: "My Khe Beach",
    tagline: "Luxurious shore without feeling totally touristy",
    summary:
      "Morning swim before heat; rent umbrella on the sand if you stay past noon.",
    status: "starred",
  },
  {
    id: "p2",
    title: "Hai Van Pass",
    tagline: "Top Gear's best coastal road — two wheels before breakfast",
    summary:
      "Scooter day-one if comfortable; go early to beat tour buses and afternoon rain.",
    status: "starred",
  },
  {
    id: "p3",
    title: "Da Nang food scene",
    tagline: "Central Vietnam's culinary capital on a budget",
    summary:
      "Bánh xèo and seafood alley — plan dinners inland when beach spots get windy.",
    status: "new",
  },
];

export const MOCK_SKETCH: TripSketch = {
  title: "Here's What I'd Do: 3 Days in Da Nang",
  atAGlance:
    "Beach-first, food-heavy, relaxed pace. Mornings outdoors, afternoons flexible for rain, evenings along the river and local markets.",
  days: [
    {
      day: 1,
      label: "Beach + street food intro",
      stops: [
        {
          order: 1,
          place: "My Khe Beach",
          detail: "Morning — swim and coffee before 11am heat.",
        },
        {
          order: 2,
          place: "Seafood alley (Vo Nguyen Giap)",
          detail: "Late lunch; walkable from the beach.",
        },
        {
          order: 3,
          place: "Han River promenade",
          detail: "Evening stroll; Dragon Bridge show on weekend nights.",
        },
      ],
    },
    {
      day: 2,
      label: "Pass + peninsula views",
      stops: [
        {
          order: 1,
          place: "Hai Van Pass",
          detail: "Start by 7am — clearer views, cooler ride.",
        },
        {
          order: 2,
          place: "Son Tra Peninsula",
          detail: "Afternoon — Linh Ung Pagoda if skies stay clear.",
        },
      ],
    },
    {
      day: 3,
      label: "Culture + slow departure",
      stops: [
        {
          order: 1,
          place: "Marble Mountains",
          detail: "Morning caves before tour groups peak.",
        },
        {
          order: 2,
          place: "Local market + Mi Quang",
          detail: "Midday food crawl; pack light for airport transfer.",
        },
      ],
    },
  ],
  localTips: [
    "Late July: afternoon downpours ~2–4pm — plan beach for mornings.",
    "Dragon Bridge fire/water show is weekend evenings only.",
    "Scooter rental: check brakes and insist on helmet; avoid pass in heavy rain.",
    "Carry cash at smaller food stalls; cards not always accepted.",
  ],
  isStale: false,
};

export const MOCK_FULL_ITINERARY: FullItineraryDay[] = [
  {
    day: 1,
    morning: "Airport → hotel (My Khe area). Breakfast: Mi Quang.",
    afternoon: "My Khe Beach + seafood alley.",
    evening: "Han River walk; Dragon Bridge if weekend.",
  },
  {
    day: 2,
    morning: "Hai Van Pass by scooter (early start).",
    afternoon: "Son Tra — Linh Ung Pagoda.",
    evening: "Night market snacks near Han River.",
  },
  {
    day: 3,
    morning: "Marble Mountains caves.",
    afternoon: "Local market + last food crawl.",
    evening: "Transfer to airport.",
  },
];
