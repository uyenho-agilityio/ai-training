"use client";

import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

import React, { useCallback, useMemo, useState } from "react";
import { copilotAgent, copilotRuntimeUrl } from "@/constants";

type CanvasTab = "places" | "book" | "itinerary";
type PlaceFilter = "all" | "starred" | "new" | "dismissed";
type ItineraryPhase = "sketch" | "generating" | "full";

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

interface PlaceBrief {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  status: "new" | "starred" | "dismissed";
}

interface RouteStop {
  order: number;
  place: string;
  detail: string;
}

interface SketchDay {
  day: number;
  label: string;
  stops: RouteStop[];
}

interface TripSketch {
  title: string;
  atAGlance: string;
  days: SketchDay[];
  localTips: string[];
  isStale: boolean;
}

interface FlightData {
  id: string;
  airline: string;
  route: string;
  price: string;
  time: string;
}

interface HotelData {
  id: string;
  name: string;
  rating: number;
  price: string;
}

interface FullItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

const HOVER_BTN =
  "cursor-pointer transition-colors hover:opacity-90 active:scale-[0.98]";

const HOVER_CARD =
  "cursor-pointer transition-all hover:border-orange-300 hover:shadow-md";

const HOVER_TAB_IDLE =
  "cursor-pointer text-slate-600 transition-all hover:bg-orange-50 hover:text-orange-600";

const TRIP_CHIPS: string[] = [
  "3 days",
  "beaches",
  "good food",
  "relaxed pace",
  "late July",
];

const MOCK_WEATHER: WeatherData = {
  temp: 32,
  condition: "Partly Cloudy",
  location: "Da Nang, Vietnam",
};

const MOCK_PLACES: PlaceBrief[] = [
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

const MOCK_SKETCH: TripSketch = {
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

const MOCK_FULL_ITINERARY: FullItineraryDay[] = [
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

const MOCK_FLIGHTS: FlightData[] = [
  {
    id: "f1",
    airline: "Vietnam Airlines",
    route: "SGN ➔ DAD",
    price: "1,500,000 VND",
    time: "08:00 - 09:20",
  },
  {
    id: "f2",
    airline: "VietJet Air",
    route: "SGN ➔ DAD",
    price: "950,000 VND",
    time: "11:30 - 12:50",
  },
];

const MOCK_HOTELS: HotelData[] = [
  {
    id: "h1",
    name: "TMS Hotel Da Nang Beach",
    rating: 4.7,
    price: "2,100,000 VND / night",
  },
  {
    id: "h2",
    name: "Sala Danang Beach Hotel",
    rating: 4.5,
    price: "1,450,000 VND / night",
  },
];

const PLACE_FILTERS: PlaceFilter[] = ["all", "starred", "new", "dismissed"];

const CANVAS_TABS: { id: CanvasTab; label: string }[] = [
  { id: "places", label: "Places" },
  { id: "book", label: "Book" },
  { id: "itinerary", label: "Itinerary" },
];

/** Compact weather row under trip header. */
const WeatherStrip = React.memo(({ weather }: { weather: WeatherData }) => (
  <div className="flex flex-col gap-2 rounded-xl border border-orange-200/80 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span aria-hidden>🌤</span>

      <span>{weather.location}</span>
    </div>

    <div className="text-left sm:text-right">
      <span className="text-lg font-black text-orange-600">
        {weather.temp}°C
      </span>

      <span className="ml-2 text-xs font-medium text-slate-500">
        {weather.condition}
      </span>
    </div>
  </div>
));
WeatherStrip.displayName = "WeatherStrip";

/** Trip context: title, mode, vibe chips. */
const TripHeader = React.memo(
  ({ title, chips }: { title: string; chips: string[] }) => (
    <header className="shrink-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
          AI TRAVEL PLANNER
        </p>

        <h1 className="text-xl font-black text-slate-800 sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip: string) => (
          <span
            key={chip}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
          >
            {chip}
          </span>
        ))}
      </div>
    </header>
  ),
);
TripHeader.displayName = "TripHeader";

/** Primary canvas navigation: Places / Book / Itinerary (equal-width tabs). */
const CanvasTabNav = React.memo(
  ({
    activeTab,

    placeCount,

    onTabChange,
  }: {
    activeTab: CanvasTab;

    placeCount: number;

    onTabChange: (tab: CanvasTab) => void;
  }) => (
    <nav className="grid w-full shrink-0 grid-cols-3 gap-2 border-b border-slate-200 bg-white pb-2">
      {CANVAS_TABS.map((tab: { id: CanvasTab; label: string }) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`w-full rounded-lg px-2 py-2.5 text-center text-sm font-bold ${
            activeTab === tab.id
              ? `bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-100 ${HOVER_BTN}`
              : HOVER_TAB_IDLE
          }`}
        >
          {tab.id === "places" ? `${tab.label} (${placeCount})` : tab.label}
        </button>
      ))}
    </nav>
  ),
);
CanvasTabNav.displayName = "CanvasTabNav";

/** Single place brief card with star and dismiss actions. */
const PlaceCard = React.memo(
  ({
    place,
    onStar,
    onDismiss,
  }: {
    place: PlaceBrief;
    onStar: (id: string) => void;
    onDismiss: (id: string) => void;
  }) => {
    const isStarred: boolean = place.status === "starred";
    const isDismissed: boolean = place.status === "dismissed";

    return (
      <article
        className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${
          isDismissed
            ? "cursor-default border-slate-200 opacity-60"
            : `${HOVER_CARD} border-slate-200`
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-black text-slate-800">{place.title}</h3>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={isStarred ? "Unstar place" : "Star place"}
              onClick={() => onStar(place.id)}
              className={`rounded-lg px-2 py-1 text-sm font-bold ${HOVER_BTN} ${
                isStarred
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-slate-100 text-slate-500 hover:bg-amber-50"
              }`}
            >
              {isStarred ? "★" : "☆"}
            </button>

            <button
              type="button"
              aria-label="Dismiss place"
              onClick={() => onDismiss(place.id)}
              className={`rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200 ${HOVER_BTN}`}
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-xs font-bold text-orange-600">{place.tagline}</p>

        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
          {place.summary}
        </p>
      </article>
    );
  },
);
PlaceCard.displayName = "PlaceCard";

/** Check-places grid with filters and sketch CTA. */
const PlacesPanel = React.memo(
  ({
    places,
    filter,
    starredCount,
    onFilterChange,
    onStar,
    onDismiss,
    onSketchFromStarred,
  }: {
    places: PlaceBrief[];
    filter: PlaceFilter;
    starredCount: number;
    onFilterChange: (filter: PlaceFilter) => void;
    onStar: (id: string) => void;
    onDismiss: (id: string) => void;
    onSketchFromStarred: () => void;
  }) => (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {PLACE_FILTERS.map((f: PlaceFilter) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange(f)}
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${HOVER_BTN} ${
              filter === f
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-orange-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {places.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
          No places in this filter. Ask in chat to research destinations.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {places.map((place: PlaceBrief) => (
            <PlaceCard
              key={place.id}
              place={place}
              onStar={onStar}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={starredCount === 0}
        onClick={onSketchFromStarred}
        className={`w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-40 ${HOVER_BTN}`}
      >
        Sketch from starred ({starredCount})
      </button>
    </section>
  ),
);
PlacesPanel.displayName = "PlacesPanel";

/** Selected flight/hotel shown on trip sketch (linked from Book tab). */
const SketchLogisticsBlock = React.memo(
  ({
    flight,
    hotel,
    onEditBookings,
  }: {
    flight: FlightData | null;
    hotel: HotelData | null;
    onEditBookings: () => void;
  }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
          Logistics (from Book)
        </h3>

        <button
          type="button"
          onClick={onEditBookings}
          className={`text-xs font-bold text-orange-600 underline-offset-2 hover:underline ${HOVER_BTN}`}
        >
          {flight || hotel ? "Change →" : "Select →"}
        </button>
      </div>

      {flight || hotel ? (
        <ul className="space-y-2 text-sm font-semibold text-slate-700">
          {flight && (
            <li>
              ✈️ {flight.airline} · {flight.route} · {flight.time}
            </li>
          )}

          {hotel && (
            <li>
              🏨 {hotel.name} · ⭐ {hotel.rating}
            </li>
          )}
        </ul>
      ) : (
        <p className="text-xs font-medium text-slate-500">
          No flight or hotel selected yet. Use Select to open Book.
        </p>
      )}
    </div>
  ),
);
SketchLogisticsBlock.displayName = "SketchLogisticsBlock";

/** One day accordion with ordered route stops. */
const SketchDayBlock = React.memo(
  ({
    day,
    isExpanded,
    onToggle,
  }: {
    day: SketchDay;
    isExpanded: boolean;
    onToggle: (dayNum: number) => void;
  }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onToggle(day.day)}
        className={`flex w-full items-center justify-between bg-white px-4 py-3 text-left hover:bg-orange-50/50 ${HOVER_BTN}`}
      >
        <span className="text-sm font-black text-slate-800">
          Day {day.day} — {day.label}
        </span>

        <span className="text-xs font-bold text-orange-600">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2 border-t border-slate-100 bg-white p-4">
          {day.stops.map((stop: RouteStop) => (
            <div
              key={`${day.day}-${stop.order}`}
              className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-xs font-black text-white">
                {stop.order}
              </span>

              <div>
                <p className="text-sm font-bold text-slate-800">{stop.place}</p>

                <p className="text-xs font-medium text-slate-500">
                  {stop.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
);
SketchDayBlock.displayName = "SketchDayBlock";

/** Full itinerary timeline after generate (Morning / Afternoon / Evening per day). */
const FullItineraryBlock = React.memo(
  ({ days }: { days: FullItineraryDay[] }) => (
    <div className="space-y-4 rounded-xl border-2 border-orange-200 bg-white p-4">
      <h3 className="text-sm font-black text-slate-800">
        Full itinerary (generated on canvas)
      </h3>

      {days.map((d: FullItineraryDay) => (
        <div
          key={d.day}
          className="rounded-lg border border-slate-200 bg-white p-3"
        >
          <p className="text-xs font-black uppercase text-orange-600">
            Day {d.day}
          </p>

          <div className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700">
            <p>
              <span className="text-orange-600">Morning —</span> {d.morning}
            </p>

            <p>
              <span className="text-orange-600">Afternoon —</span> {d.afternoon}
            </p>

            <p>
              <span className="text-orange-600">Evening —</span> {d.evening}
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
);
FullItineraryBlock.displayName = "FullItineraryBlock";

/** Trip sketch: at a glance, day-by-day route, local tips, logistics, generate CTA. */
const TripSketchPanel = React.memo(
  ({
    sketch,
    expandedDays,
    itineraryPhase,
    fullItineraryDays,
    selectedFlight,
    selectedHotel,
    onToggleDay,
    onRefreshSketch,
    onGenerateItinerary,
    onEditBookings,
  }: {
    sketch: TripSketch;
    expandedDays: number[];
    itineraryPhase: ItineraryPhase;
    fullItineraryDays: FullItineraryDay[];
    selectedFlight: FlightData | null;
    selectedHotel: HotelData | null;
    onToggleDay: (dayNum: number) => void;
    onRefreshSketch: () => void;
    onGenerateItinerary: () => void;
    onEditBookings: () => void;
  }) => (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-black text-slate-800 sm:text-lg">
          {sketch.title}
        </h2>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Your trip, sketched out
        </p>
      </div>

      {sketch.isStale && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-amber-900">
            Things changed — new briefs or chat since this sketch. Want a fresh
            take?
          </p>

          <button
            type="button"
            onClick={onRefreshSketch}
            className={`shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 ${HOVER_BTN}`}
          >
            Refresh sketch
          </button>
        </div>
      )}

      <SketchLogisticsBlock
        flight={selectedFlight}
        hotel={selectedHotel}
        onEditBookings={onEditBookings}
      />

      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
          At a glance
        </h3>

        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
          {sketch.atAGlance}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
          Day by day
        </h3>

        {sketch.days.map((day: SketchDay) => (
          <SketchDayBlock
            key={day.day}
            day={day}
            isExpanded={expandedDays.includes(day.day)}
            onToggle={onToggleDay}
          />
        ))}
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
          Local tips ({sketch.localTips.length})
        </h3>

        <ul className="mt-2 space-y-1.5">
          {sketch.localTips.map((tip: string, index: number) => (
            <li
              key={index}
              className="flex gap-2 text-xs font-semibold text-slate-700"
            >
              <span className="text-orange-500">•</span>

              {tip}
            </li>
          ))}
        </ul>
      </div>

      {itineraryPhase === "full" && (
        <FullItineraryBlock days={fullItineraryDays} />
      )}

      <button
        type="button"
        disabled={itineraryPhase === "generating"}
        onClick={onGenerateItinerary}
        className={`w-full rounded-xl border-2 border-dashed border-orange-300 bg-white py-3 text-sm font-bold text-orange-600 hover:border-orange-400 hover:bg-orange-50 disabled:cursor-wait disabled:opacity-70 ${HOVER_BTN}`}
      >
        {itineraryPhase === "generating"
          ? "Generating…"
          : itineraryPhase === "full"
            ? "Regenerate"
            : "Let's make it real"}
      </button>

      {itineraryPhase === "generating" && (
        <p className="text-center text-xs font-medium text-slate-500">
          (Draft demo: agent would stream state → canvas updates below, not only
          chat text.)
        </p>
      )}
    </section>
  ),
);
TripSketchPanel.displayName = "TripSketchPanel";

/** Flight or hotel card with select action. */
const BookingCard = React.memo(
  ({
    isSelected,
    onSelect,
    children,
    price,
    actionLabel,
  }: {
    isSelected: boolean;
    onSelect: () => void;
    children: React.ReactNode;
    price: string;
    actionLabel: string;
  }) => (
    <div
      className={`flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm ${
        isSelected
          ? "border-orange-400 ring-2 ring-orange-200"
          : `${HOVER_CARD} border-slate-200`
      }`}
    >
      {children}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-extrabold text-orange-600">{price}</span>

        <button
          type="button"
          onClick={onSelect}
          className={`rounded-md px-3 py-1.5 text-xs font-bold text-white shadow-sm ${HOVER_BTN} ${
            isSelected
              ? "bg-slate-600 hover:bg-slate-700"
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          }`}
        >
          {isSelected ? "Selected" : actionLabel}
        </button>
      </div>
    </div>
  ),
);
BookingCard.displayName = "BookingCard";

/** Flights and hotels with HITL selection. */
const BookPanel = React.memo(
  ({
    flights,
    hotels,
    selectedFlightId,
    selectedHotelId,
    onSelectFlight,
    onSelectHotel,
    onViewSketch,
  }: {
    flights: FlightData[];
    hotels: HotelData[];
    selectedFlightId: string | null;
    selectedHotelId: string | null;
    onSelectFlight: (id: string) => void;
    onSelectHotel: (id: string) => void;
    onViewSketch: () => void;
  }) => (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <p className="text-xs font-medium text-slate-500">
        Select flight & hotel — choices sync to{" "}
        <button
          type="button"
          onClick={onViewSketch}
          className={`font-bold text-orange-600 underline-offset-2 hover:underline ${HOVER_BTN}`}
        >
          Logistics on Itinerary
        </button>
        .
      </p>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          ✈️ Flights
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {flights.map((flight: FlightData) => (
            <BookingCard
              key={flight.id}
              isSelected={selectedFlightId === flight.id}
              onSelect={() => onSelectFlight(flight.id)}
              price={flight.price}
              actionLabel="Select"
            >
              <span className="text-xs font-bold text-slate-400">
                {flight.airline}
              </span>

              <h4 className="mt-0.5 text-base font-black text-slate-800">
                {flight.route}
              </h4>

              <p className="mt-1 text-xs font-medium text-slate-500">
                🕒 {flight.time}
              </p>
            </BookingCard>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          🏨 Hotels
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hotels.map((hotel: HotelData) => (
            <BookingCard
              key={hotel.id}
              isSelected={selectedHotelId === hotel.id}
              onSelect={() => onSelectHotel(hotel.id)}
              price={hotel.price}
              actionLabel="Select"
            >
              <h4 className="text-base font-black text-slate-800">
                {hotel.name}
              </h4>

              <p className="mt-1 text-xs font-bold text-amber-500">
                ⭐ {hotel.rating} / 5.0
              </p>
            </BookingCard>
          ))}
        </div>
      </div>
    </section>
  ),
);
BookPanel.displayName = "BookPanel";

/** Filter places by status for the Places tab. */
const filterPlacesByStatus = (
  places: PlaceBrief[],

  filter: PlaceFilter,
): PlaceBrief[] => {
  if (filter === "all")
    return places.filter((p: PlaceBrief) => p.status !== "dismissed");

  return places.filter((p: PlaceBrief) => p.status === filter);
};

/** Toggle starred / new status on a place card. */
const togglePlaceStar = (places: PlaceBrief[], id: string): PlaceBrief[] =>
  places.map((p: PlaceBrief) => {
    if (p.id !== id) return p;

    const nextStatus: PlaceBrief["status"] =
      p.status === "starred" ? "new" : "starred";

    return { ...p, status: nextStatus };
  });

/** Mark a place as dismissed. */
const dismissPlace = (places: PlaceBrief[], id: string): PlaceBrief[] =>
  places.map((p: PlaceBrief) =>
    p.id === id ? { ...p, status: "dismissed" as const } : p,
  );

/** Resolve selected booking by id from mock lists. */
const findFlightById = (
  flights: FlightData[],

  id: string | null,
): FlightData | null =>
  id ? (flights.find((f: FlightData) => f.id === id) ?? null) : null;

const findHotelById = (
  hotels: HotelData[],

  id: string | null,
): HotelData | null =>
  id ? (hotels.find((h: HotelData) => h.id === id) ?? null) : null;

/** Draft travel canvas (Voyaige-style); chat is CopilotKit elsewhere. */
const TravelCanvas = React.memo(() => {
  const [activeTab, setActiveTab] = useState<CanvasTab>("places");
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("all");
  const [places, setPlaces] = useState<PlaceBrief[]>(MOCK_PLACES);
  const [sketch, setSketch] = useState<TripSketch>(MOCK_SKETCH);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [itineraryPhase, setItineraryPhase] =
    useState<ItineraryPhase>("sketch");

  const filteredPlaces: PlaceBrief[] = useMemo(
    () => filterPlacesByStatus(places, placeFilter),
    [places, placeFilter],
  );
  const starredCount: number = useMemo(
    () => places.filter((p: PlaceBrief) => p.status === "starred").length,
    [places],
  );
  const selectedFlight: FlightData | null = useMemo(
    () => findFlightById(MOCK_FLIGHTS, selectedFlightId),
    [selectedFlightId],
  );
  const selectedHotel: HotelData | null = useMemo(
    () => findHotelById(MOCK_HOTELS, selectedHotelId),
    [selectedHotelId],
  );

  const handleTabChange = useCallback((tab: CanvasTab): void => {
    setActiveTab(tab);
  }, []);

  const handleStar = useCallback((id: string): void => {
    setPlaces((prev: PlaceBrief[]) => togglePlaceStar(prev, id));
  }, []);

  const handleDismiss = useCallback((id: string): void => {
    setPlaces((prev: PlaceBrief[]) => dismissPlace(prev, id));
  }, []);

  const handleSketchFromStarred = useCallback((): void => {
    setSketch((prev: TripSketch) => ({ ...prev, isStale: false }));
    setActiveTab("itinerary");
    setExpandedDays([1]);
  }, []);

  const handleToggleDay = useCallback((dayNum: number): void => {
    setExpandedDays((prev: number[]) =>
      prev.includes(dayNum)
        ? prev.filter((d: number) => d !== dayNum)
        : [...prev, dayNum],
    );
  }, []);

  const handleRefreshSketch = useCallback((): void => {
    setSketch((prev: TripSketch) => ({ ...prev, isStale: false }));
  }, []);

  const handleSelectFlight = useCallback((id: string): void => {
    setSelectedFlightId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const handleSelectHotel = useCallback((id: string): void => {
    setSelectedHotelId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const handleEditBookings = useCallback((): void => {
    setActiveTab("book");
  }, []);

  const handleViewSketch = useCallback((): void => {
    setActiveTab("itinerary");
  }, []);

  /** Demo: simulate agent generating full itinerary onto canvas. */
  const handleGenerateItinerary = useCallback((): void => {
    setItineraryPhase("generating");

    window.setTimeout(() => {
      setItineraryPhase("full");
      setExpandedDays([1, 2, 3]);
    }, 1400);
  }, []);

  return (
    <main className="flex min-h-screen w-full min-w-0 flex-col gap-4 overflow-y-auto bg-white p-4 sm:gap-5 sm:p-10">
      <TripHeader title="3 Days in Da Nang" chips={TRIP_CHIPS} />
      <WeatherStrip weather={MOCK_WEATHER} />

      <CanvasTabNav
        activeTab={activeTab}
        placeCount={
          places.filter((p: PlaceBrief) => p.status !== "dismissed").length
        }
        onTabChange={handleTabChange}
      />

      <div className="min-h-0 flex-1 pb-6">
        {activeTab === "places" && (
          <PlacesPanel
            places={filteredPlaces}
            filter={placeFilter}
            starredCount={starredCount}
            onFilterChange={setPlaceFilter}
            onStar={handleStar}
            onDismiss={handleDismiss}
            onSketchFromStarred={handleSketchFromStarred}
          />
        )}

        {activeTab === "book" && (
          <BookPanel
            flights={MOCK_FLIGHTS}
            hotels={MOCK_HOTELS}
            selectedFlightId={selectedFlightId}
            selectedHotelId={selectedHotelId}
            onSelectFlight={handleSelectFlight}
            onSelectHotel={handleSelectHotel}
            onViewSketch={handleViewSketch}
          />
        )}

        {activeTab === "itinerary" && (
          <TripSketchPanel
            sketch={sketch}
            expandedDays={expandedDays}
            itineraryPhase={itineraryPhase}
            fullItineraryDays={MOCK_FULL_ITINERARY}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            onToggleDay={handleToggleDay}
            onRefreshSketch={handleRefreshSketch}
            onGenerateItinerary={handleGenerateItinerary}
            onEditBookings={handleEditBookings}
          />
        )}
      </div>
    </main>
  );
});
TravelCanvas.displayName = "TravelCanvas";

const CHAT_LABELS = {
  title: "AI Travel Planner",
  initial: "Hi! 👋 How can I help you with your travel plans?",
} as const;

type TravelChatAsideProps = {
  onClose: () => void;
};

/** Inline chat column — flex sibling of canvas (no fixed overlay). */
const TravelChatAside = React.memo(({ onClose }: TravelChatAsideProps) => (
  <aside className="flex h-[min(100dvh,640px)] w-full shrink-0 flex-col border-t border-slate-200 bg-white sm:h-screen sm:w-[28rem] sm:border-t-0 sm:border-l">
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 className="text-sm font-semibold text-slate-900">
        {CHAT_LABELS.title}
      </h2>
      <button
        type="button"
        aria-label="Hide chat"
        className={`rounded-md px-2 py-1 text-sm text-slate-500 ${HOVER_BTN}`}
        onClick={onClose}
      >
        X
      </button>
    </div>
    <div className="flex min-h-0 flex-1 flex-col">
      <CopilotChat
        className="flex h-full min-h-0 flex-col"
        labels={CHAT_LABELS}
      />
    </div>
  </aside>
));
TravelChatAside.displayName = "TravelChatAside";

/** Canvas + chat side-by-side; canvas always fully visible in its column. */
const TravelPlannerShell = (): React.JSX.Element => {
  const [chatOpen, setChatOpen] = useState<boolean>(true);

  const handleOpenChat = useCallback((): void => {
    setChatOpen(true);
  }, []);

  const handleCloseChat = useCallback((): void => {
    setChatOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col sm:flex-row">
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <TravelCanvas />
      </div>

      <CopilotSidebar
        defaultOpen
        clickOutsideToClose={false}
        labels={{
          title: "AI Assistant",
          initial: "Hi! 👋 How can I help you with your travel plans?",
        }}
      />

      {/* {chatOpen ? (
        <TravelChatAside onClose={handleCloseChat} />
      ) : (
        <button
          type="button"
          aria-label="Open chat"
          className={`fixed bottom-6 right-6 z-30 rounded-full bg-linear-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-medium text-white shadow-lg ${HOVER_BTN}`}
          onClick={handleOpenChat}
        >
          Chat
        </button>
      )} */}
    </div>
  );
};

export default function Home() {
  return (
    <CopilotKit runtimeUrl={copilotRuntimeUrl} agent={copilotAgent}>
      <TravelPlannerShell />
    </CopilotKit>
  );
}

//  <CopilotKit runtimeUrl={copilotRuntimeUrl} agent={copilotAgent}>
//       <div className="flex min-h-screen w-full flex-col sm:flex-row">
//         <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
//           <main className="flex min-h-screen w-full min-w-0 flex-col gap-4 overflow-y-auto bg-white p-4 sm:gap-5 sm:p-10">
//             <div className="shrink-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//               <div>
//                 <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
//                   AI TRAVEL PLANNER
//                 </p>

//                 <h1 className="text-xl font-black text-slate-800 sm:text-2xl">
//                   3 days in ...
//                 </h1>
//               </div>
//             </div>
//           </main>
//         </div>

//         <CopilotSidebar
//           defaultOpen
//           clickOutsideToClose={false}
//           labels={{
//             title: "AI Assistant",
//             initial: "Hi! 👋 How can I help you with your travel plans?",
//           }}
//         />
//       </div>
//     </CopilotKit>
