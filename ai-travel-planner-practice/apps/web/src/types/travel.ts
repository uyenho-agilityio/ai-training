export type CanvasTab = "places" | "book" | "itinerary";
export type PlaceFilter = "all" | "starred" | "new" | "dismissed";
export type PlaceStatus = "new" | "starred" | "dismissed";
export type ItineraryPhase = "sketch" | "generating" | "full";
export type StatusCardVariant = "success" | "error" | "warning";

export type TabNavItem = {
  id: string;
  label: string;
};

export type WeatherCondition =
  | "Clear sky"
  | "Mainly clear"
  | "Partly cloudy"
  | "Overcast"
  | "Foggy"
  | "Depositing rime fog"
  | "Light drizzle"
  | "Moderate drizzle"
  | "Dense drizzle"
  | "Light freezing drizzle"
  | "Dense freezing drizzle"
  | "Slight rain"
  | "Moderate rain"
  | "Heavy rain"
  | "Light freezing rain"
  | "Heavy freezing rain"
  | "Slight snow fall"
  | "Moderate snow fall"
  | "Heavy snow fall"
  | "Snow grains"
  | "Slight rain showers"
  | "Moderate rain showers"
  | "Violent rain showers"
  | "Slight snow showers"
  | "Heavy snow showers"
  | "Thunderstorm"
  | "Thunderstorm with slight hail"
  | "Thunderstorm with heavy hail"
  | "Unknown";

export type TemperatureUnit = "C" | "F";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  condition: WeatherCondition;
  location: string;
}

export interface WeatherToolResult {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
}

export interface PlaceBrief {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  status: PlaceStatus;
}

export interface RouteStop {
  order: number;
  place: string;
  detail: string;
}

export interface SketchDay {
  day: number;
  label: string;
  stops: RouteStop[];
}

export interface TripSketch {
  title: string;
  atAGlance: string;
  days: SketchDay[];
  localTips: string[];
  isStale: boolean;
}

export interface BookingItem {
  id: string;
}

export interface FlightData extends BookingItem {
  airline: string;
  route: string;
  price: string;
  time: string;
}

export interface HotelData extends BookingItem {
  name: string;
  rating: number;
  price: string;
}

export interface FlightsToolResult {
  flights: FlightData[];
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

export interface HotelsToolResult {
  hotels: HotelData[];
  location: string;
  checkIn: string;
  checkOut: string;
}

export type TripBookingsToolResult = FlightsToolResult & HotelsToolResult;

export interface FullItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export type BookingCardType = "flight" | "hotel";

type BookingCardBaseProps = {
  isSelected: boolean;
  onSelect: () => void;
  actionLabel?: string;
};

export type BookingCardProps =
  | (BookingCardBaseProps & {
      type: "flight";
      item: FlightData;
    })
  | (BookingCardBaseProps & {
      type: "hotel";
      item: HotelData;
    });

export type WeatherDetailItem = {
  id: string;
  label: string;
  value: string;
};

export type TripCanvasState = {
  activeTab: CanvasTab;
  placeFilter: PlaceFilter;
  places: PlaceBrief[];
  sketch: TripSketch;
  flights: FlightData[];
  hotels: HotelData[];
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  weather: WeatherData | null;
  itineraryPhase: ItineraryPhase;
  expandedDays: number[];
};

export type ToolDrivenCanvasPatch = Partial<
  Pick<TripCanvasState, "weather" | "flights" | "hotels" | "activeTab">
>;

export type ToolSyncKind = "tripBookings" | "flights" | "hotels" | "weather";

export type CopilotMessage = {
  role?: string;
  toolCallId?: string;
  content?: unknown;
  toolCalls?: Array<{
    id: string;
    function?: { name?: string };
  }>;
};

export type ToolRenderPayloadSource = {
  result?: unknown;
  output?: unknown;
};
