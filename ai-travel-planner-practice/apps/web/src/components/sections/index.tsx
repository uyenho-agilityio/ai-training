"use client";

import { memo, useCallback, useMemo, useState, type ReactElement } from "react";

import { Header } from "@/components/Header";
import { TabNav } from "@/components/TabNav";
import {
  MOCK_FLIGHTS,
  MOCK_FULL_ITINERARY,
  MOCK_HOTELS,
  MOCK_PLACES,
  MOCK_SKETCH,
  MOCK_WEATHER_TOOL_DATA_RESULT,
} from "@/constants";
import type {
  CanvasTab,
  FlightData,
  HotelData,
  ItineraryPhase,
  PlaceBrief,
  PlaceFilter,
  TripSketch,
  WeatherToolResult,
} from "@/types";
import {
  mapWeatherToolResult,
  dismissPlace,
  filterPlacesByStatus,
  findBookingById,
  togglePlaceStar,
} from "@/utils";
import { WeatherCard } from "../WeatherCard";
import { BookSection } from "./BookSection";
import { CANVAS_TABS } from "../../constants/travel";
import { ItinerarySection } from "./ItinerarySection";
import { PlacesSection } from "./PlacesSection";

const TravelCanvasComponent = (): ReactElement => {
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

  const starredCount = useMemo(
    () =>
      places.filter((place: PlaceBrief) => place.status === "starred").length,
    [places],
  );

  const selectedFlight = useMemo(
    () => findBookingById<FlightData>(MOCK_FLIGHTS, selectedFlightId),
    [selectedFlightId],
  );

  const selectedHotel = useMemo(
    () => findBookingById<HotelData>(MOCK_HOTELS, selectedHotelId),
    [selectedHotelId],
  );

  const previewWeather = useMemo(
    () =>
      mapWeatherToolResult(
        JSON.parse(MOCK_WEATHER_TOOL_DATA_RESULT) as WeatherToolResult,
      ),
    [],
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as CanvasTab);
  }, []);

  const handleFilterChange = useCallback((filter: PlaceFilter) => {
    setPlaceFilter(filter);
  }, []);

  const handleStar = useCallback((id: string) => {
    setPlaces((prev: PlaceBrief[]) => togglePlaceStar(prev, id));
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setPlaces((prev: PlaceBrief[]) => dismissPlace(prev, id));
  }, []);

  const handleSketchFromStarred = useCallback(() => {
    setSketch((prev: TripSketch) => ({ ...prev, isStale: false }));
    setActiveTab("itinerary");
    setExpandedDays([1]);
  }, []);

  const handleToggleDay = useCallback((dayNum: number) => {
    setExpandedDays((prev: number[]) =>
      prev.includes(dayNum)
        ? prev.filter((day: number) => day !== dayNum)
        : [...prev, dayNum],
    );
  }, []);

  const handleRefreshSketch = useCallback(() => {
    setSketch((prev: TripSketch) => ({ ...prev, isStale: false }));
  }, []);

  const handleSelectFlight = useCallback((id: string) => {
    setSelectedFlightId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const handleSelectHotel = useCallback((id: string) => {
    setSelectedHotelId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const handleEditBookings = useCallback(() => {
    setActiveTab("book");
  }, []);

  const handleViewSketch = useCallback(() => {
    setActiveTab("itinerary");
  }, []);

  const handleGenerateItinerary = useCallback(() => {
    setItineraryPhase("generating");

    window.setTimeout(() => {
      setItineraryPhase("full");
      setExpandedDays([1, 2, 3]);
    }, 1400);
  }, []);

  return (
    <main className="flex min-h-screen w-full min-w-0 flex-col gap-4 overflow-y-auto bg-white p-4 sm:gap-5 sm:p-10">
      <Header title="3 Days in Da Nang" />
      <WeatherCard weather={previewWeather} />

      <TabNav
        tabs={CANVAS_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="min-h-0 flex-1 pb-6">
        {activeTab === "places" && (
          <PlacesSection
            places={filteredPlaces}
            starredCount={starredCount}
            onFilterChange={handleFilterChange}
            onStar={handleStar}
            onDismiss={handleDismiss}
            onSketchFromStarred={handleSketchFromStarred}
          />
        )}

        {activeTab === "book" && (
          <BookSection
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
          <ItinerarySection
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
};

export const TravelCanvas = memo(TravelCanvasComponent);
