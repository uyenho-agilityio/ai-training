"use client";

import { memo, useCallback, useMemo, useState, type ReactElement } from "react";

import { useCoAgent } from "@copilotkit/react-core";

import { TabNav, Header, SyncTripToolResults } from "@/components";
import {
  copilotAgent,
  INITIAL_TRIP_STATE,
  MOCK_FULL_ITINERARY,
} from "@/constants";
import type {
  CanvasTab,
  FlightData,
  HotelData,
  PlaceBrief,
  PlaceFilter,
  ToolDrivenCanvasPatch,
  TripCanvasState,
} from "@/types";
import {
  dismissPlace,
  filterPlacesByStatus,
  findBookingById,
  togglePlaceStar,
} from "@/utils";
import { CANVAS_TABS } from "@/constants";
import { WeatherCard } from "../WeatherCard";
import { BookSection } from "./BookSection";
import { ItinerarySection } from "./ItinerarySection";
import { PlacesSection } from "./PlacesSection";

const TravelCanvasComponent = (): ReactElement => {
  const { state, setState } = useCoAgent<TripCanvasState>({
    name: copilotAgent,
    initialState: INITIAL_TRIP_STATE,
  });

  const [toolPatch, setToolPatch] = useState<ToolDrivenCanvasPatch>({});

  const canvasState = useMemo(
    () => ({
      ...(state ?? INITIAL_TRIP_STATE),
      ...toolPatch,
    }),
    [state, toolPatch],
  );

  const {
    activeTab,
    placeFilter,
    places,
    sketch,
    flights,
    hotels,
    selectedFlightId,
    selectedHotelId,
    weather,
    itineraryPhase,
    expandedDays,
  } = canvasState;

  const filteredPlaces: PlaceBrief[] = useMemo(
    () => filterPlacesByStatus(places, placeFilter),
    [places, placeFilter],
  );

  const starredCount = useMemo(
    () =>
      places?.filter((place: PlaceBrief) => place.status === "starred").length,
    [places],
  );

  const selectedFlight = useMemo(
    () => findBookingById<FlightData>(flights, selectedFlightId),
    [flights, selectedFlightId],
  );

  const selectedHotel = useMemo(
    () => findBookingById<HotelData>(hotels, selectedHotelId),
    [hotels, selectedHotelId],
  );

  const patchState = useCallback(
    (patch: Partial<TripCanvasState>) => {
      setState((prev: TripCanvasState | undefined) => ({
        ...(prev ?? INITIAL_TRIP_STATE),
        ...patch,
      }));
    },
    [setState],
  );

  const releaseToolTabPatch = useCallback((): void => {
    setToolPatch((prev: ToolDrivenCanvasPatch) => {
      if (prev.activeTab === undefined) {
        return prev;
      }

      const { activeTab: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const stickToolTabPatch = useCallback((tab: CanvasTab): void => {
    setToolPatch((prev: ToolDrivenCanvasPatch) => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  const navigateToTab = useCallback(
    (tab: CanvasTab): void => {
      stickToolTabPatch(tab);
      patchState({ activeTab: tab });
    },
    [patchState, stickToolTabPatch],
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      releaseToolTabPatch();
      patchState({ activeTab: tab as CanvasTab });
    },
    [patchState, releaseToolTabPatch],
  );

  const handleFilterChange = useCallback(
    (filter: PlaceFilter) => {
      patchState({ placeFilter: filter });
    },
    [patchState],
  );

  const handleStar = useCallback(
    (id: string) => {
      patchState({ places: togglePlaceStar(places, id) });
    },
    [patchState, places],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      patchState({ places: dismissPlace(places, id) });
    },
    [patchState, places],
  );

  const handleSketchFromStarred = useCallback(() => {
    patchState({
      sketch: { ...sketch, isStale: false },
      expandedDays: [1],
    });
    navigateToTab("itinerary");
  }, [navigateToTab, patchState, sketch]);

  const handleToggleDay = useCallback(
    (dayNum: number) => {
      const nextExpandedDays = expandedDays.includes(dayNum)
        ? expandedDays.filter((day: number) => day !== dayNum)
        : [...expandedDays, dayNum];

      patchState({ expandedDays: nextExpandedDays });
    },
    [expandedDays, patchState],
  );

  const handleRefreshSketch = useCallback(() => {
    patchState({ sketch: { ...sketch, isStale: false } });
  }, [patchState, sketch]);

  const handleSelectFlight = useCallback(
    (id: string) => {
      patchState({
        selectedFlightId: selectedFlightId === id ? null : id,
      });
    },
    [patchState, selectedFlightId],
  );

  const handleSelectHotel = useCallback(
    (id: string) => {
      patchState({
        selectedHotelId: selectedHotelId === id ? null : id,
      });
    },
    [patchState, selectedHotelId],
  );

  const handleEditBookings = useCallback(() => {
    navigateToTab("book");
  }, [navigateToTab]);

  const handleViewSketch = useCallback(() => {
    navigateToTab("itinerary");
  }, [navigateToTab]);

  const handleGenerateItinerary = useCallback(() => {
    patchState({ itineraryPhase: "generating" });

    window.setTimeout(() => {
      setState((prev: TripCanvasState | undefined) => ({
        ...(prev ?? INITIAL_TRIP_STATE),
        itineraryPhase: "full",
        expandedDays: [1, 2, 3],
      }));
    }, 1400);
  }, [setState]);

  return (
    <>
      <SyncTripToolResults setState={setState} setToolPatch={setToolPatch} />

      <main className="flex min-h-screen w-full min-w-0 flex-col gap-4 overflow-y-auto bg-white p-4 sm:gap-5 sm:p-10">
        <Header title="Plan places, book travel & build your itinerary" />
        {weather ? <WeatherCard weather={weather} /> : null}

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
              flights={flights}
              hotels={hotels}
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
    </>
  );
};

export const TravelCanvas = memo(TravelCanvasComponent);
