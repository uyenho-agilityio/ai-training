"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";

import { useCoAgent } from "@copilotkit/react-core";

import {
  Confirmation,
  Header,
  Modal,
  SyncTripToolResults,
  TabNav,
} from "@/components";
import {
  copilotAgent,
  INITIAL_TRIP_STATE,
  PLANNING_IN_PROGRESS_MESSAGE,
  SKETCH_READY_ON_PLACES_MESSAGE,
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
  buildGenerateItineraryConfirmMessage,
  buildGenerateItineraryMessage,
  buildSketchFromStarredMessage,
  dismissPlace,
  filterPlacesByStatus,
  findBookingById,
  getGenerateItineraryReadiness,
  mergeCanvasState,
  togglePlaceStar,
} from "@/utils";
import { CANVAS_TABS } from "@/constants";
import { useRunAgentMessage } from "@/hooks";
import { WeatherCard } from "../WeatherCard";
import { BookSection } from "./BookSection";
import { ItinerarySection } from "./ItinerarySection";
import { PlacesSection } from "./PlacesSection";

const TOOL_PATCH_MIRROR_KEYS = [
  "places",
  "sketch",
  "flights",
  "hotels",
  "weather",
  "expandedDays",
  "itineraryPhase",
  "fullItinerary",
  "selectedFlightId",
  "selectedHotelId",
  "isGenerateConfirm",
] as const satisfies ReadonlyArray<keyof ToolDrivenCanvasPatch>;

const TravelCanvasComponent = (): ReactElement => {
  const {
    state,
    setState,
    running: isAgentRunning,
  } = useCoAgent<TripCanvasState>({
    name: copilotAgent,
    initialState: INITIAL_TRIP_STATE,
  });

  const { runAgentMessage } = useRunAgentMessage();

  const [toolPatch, setToolPatch] = useState<ToolDrivenCanvasPatch>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSketchPending, setIsSketchPending] = useState<boolean>(false);
  const [isGeneratePending, setIsGeneratePending] = useState<boolean>(false);

  useEffect(() => {
    if (!isAgentRunning) {
      setIsSketchPending(false);
      setIsGeneratePending(false);
    }
  }, [isAgentRunning]);

  const canvasState = useMemo(
    (): TripCanvasState => mergeCanvasState(state, toolPatch),
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
    fullItinerary,
    isGenerateConfirm,
  } = canvasState;

  const filteredPlaces: PlaceBrief[] = useMemo(
    () => filterPlacesByStatus(places, placeFilter),
    [places, placeFilter],
  );

  const starredPlaces: PlaceBrief[] = useMemo(
    (): PlaceBrief[] =>
      (places ?? []).filter((place: PlaceBrief) => place.status === "starred"),
    [places],
  );

  const starredCount = starredPlaces.length;

  const isPlanningInProgress: boolean = useMemo(
    () =>
      isAgentRunning &&
      (places?.length ?? 0) > 0 &&
      (sketch?.days?.length ?? 0) === 0,
    [isAgentRunning, places, sketch?.days],
  );

  const isSketchReadyOnPlaces: boolean = useMemo(
    () =>
      activeTab === "places" &&
      !isAgentRunning &&
      (places?.length ?? 0) > 0 &&
      (sketch?.days?.length ?? 0) > 0,
    [activeTab, isAgentRunning, places, sketch?.days],
  );

  const selectedFlight = useMemo(
    () => findBookingById<FlightData>(flights, selectedFlightId),
    [flights, selectedFlightId],
  );

  const selectedHotel = useMemo(
    () => findBookingById<HotelData>(hotels, selectedHotelId),
    [hotels, selectedHotelId],
  );

  const itineraryReadiness = useMemo(
    () =>
      getGenerateItineraryReadiness({
        places,
        flights,
        hotels,
        selectedFlightId,
        selectedHotelId,
        sketch,
      }),
    [places, flights, hotels, selectedFlightId, selectedHotelId, sketch],
  );

  const disabledReason = useMemo((): string => {
    if (itineraryReadiness.isReady) {
      return "";
    }

    const labels: Record<(typeof itineraryReadiness.missing)[number], string> =
      {
        places: "places",
        flights: "flight search results",
        hotels: "hotel search results",
        routes: "day-by-day routes",
        localTips: "local tips",
      };

    const missingLabels = itineraryReadiness.missing.map(
      (requirement) => labels[requirement],
    );

    return `Add ${missingLabels.join(", ")} to generate your full itinerary.`;
  }, [itineraryReadiness]);

  const patchState = useCallback(
    (patch: Partial<TripCanvasState>) => {
      setState((prev: TripCanvasState | undefined) => ({
        ...(prev ?? INITIAL_TRIP_STATE),
        ...patch,
      }));
    },
    [setState],
  );

  const patchCanvasState = useCallback(
    (patch: Partial<TripCanvasState>) => {
      patchState(patch);

      setToolPatch((prev: ToolDrivenCanvasPatch) => {
        const hasUpdates = TOOL_PATCH_MIRROR_KEYS.some(
          (key: keyof ToolDrivenCanvasPatch) => patch[key] !== undefined,
        );

        if (!hasUpdates) {
          return prev;
        }

        return {
          ...prev,
          ...(patch.places !== undefined ? { places: patch.places } : {}),
          ...(patch.sketch !== undefined ? { sketch: patch.sketch } : {}),
          ...(patch.flights !== undefined ? { flights: patch.flights } : {}),
          ...(patch.hotels !== undefined ? { hotels: patch.hotels } : {}),
          ...(patch.weather !== undefined ? { weather: patch.weather } : {}),
          ...(patch.expandedDays !== undefined
            ? { expandedDays: patch.expandedDays }
            : {}),
          ...(patch.itineraryPhase !== undefined
            ? { itineraryPhase: patch.itineraryPhase }
            : {}),
          ...(patch.fullItinerary !== undefined
            ? { fullItinerary: patch.fullItinerary }
            : {}),
          ...(patch.selectedFlightId !== undefined
            ? { selectedFlightId: patch.selectedFlightId }
            : {}),
          ...(patch.selectedHotelId !== undefined
            ? { selectedHotelId: patch.selectedHotelId }
            : {}),
          ...(patch.isGenerateConfirm !== undefined
            ? { isGenerateConfirm: patch.isGenerateConfirm }
            : {}),
        };
      });
    },
    [patchState],
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
      patchCanvasState({ places: togglePlaceStar(places, id) });
    },
    [patchCanvasState, places],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      patchCanvasState({ places: dismissPlace(places, id) });
    },
    [patchCanvasState, places],
  );

  const handleSketchFromStarred = useCallback(async (): Promise<void> => {
    if (starredPlaces.length === 0) {
      return;
    }

    const tripDays: number =
      sketch?.days?.length && sketch.days.length > 0
        ? sketch.days.length
        : Math.max(starredPlaces.length, 1);

    patchCanvasState({ places });

    setIsSketchPending(true);
    await runAgentMessage(
      buildSketchFromStarredMessage(starredPlaces, tripDays),
    );
  }, [patchCanvasState, places, runAgentMessage, sketch?.days, starredPlaces]);

  const handleToggleDay = useCallback(
    (dayNum: number) => {
      const nextExpandedDays = expandedDays.includes(dayNum)
        ? expandedDays.filter((day: number) => day !== dayNum)
        : [...expandedDays, dayNum];

      patchCanvasState({ expandedDays: nextExpandedDays });
    },
    [expandedDays, patchCanvasState],
  );

  const handleRefreshSketch = useCallback(() => {
    patchCanvasState({ sketch: { ...sketch, isStale: false } });
  }, [patchCanvasState, sketch]);

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

  const handleOpenGenerateItineraryConfirm = useCallback((): void => {
    const autoFlightId: string | null =
      selectedFlightId ?? flights[0]?.id ?? null;
    const autoHotelId: string | null = selectedHotelId ?? hotels[0]?.id ?? null;

    if (!autoFlightId || !autoHotelId || !itineraryReadiness.isReady) {
      return;
    }

    if (autoFlightId !== selectedFlightId || autoHotelId !== selectedHotelId) {
      patchState({
        selectedFlightId: autoFlightId,
        selectedHotelId: autoHotelId,
      });
    }

    setIsConfirmOpen(true);
  }, [
    flights,
    hotels,
    itineraryReadiness.isReady,
    patchState,
    selectedFlightId,
    selectedHotelId,
  ]);

  const generateConfirmMessage = useMemo((): string => {
    const flight: FlightData | null = findBookingById<FlightData>(
      flights,
      selectedFlightId ?? flights[0]?.id ?? null,
    );
    const hotel: HotelData | null = findBookingById<HotelData>(
      hotels,
      selectedHotelId ?? hotels[0]?.id ?? null,
    );

    return buildGenerateItineraryConfirmMessage(flight, hotel);
  }, [flights, hotels, selectedFlightId, selectedHotelId]);

  useEffect(() => {
    if (!isGenerateConfirm || !itineraryReadiness.isReady) {
      return;
    }

    patchCanvasState({ isGenerateConfirm: false });
    handleOpenGenerateItineraryConfirm();
  }, [
    handleOpenGenerateItineraryConfirm,
    itineraryReadiness.isReady,
    patchCanvasState,
    isGenerateConfirm,
  ]);

  const handleConfirmGenerateItinerary =
    useCallback(async (): Promise<void> => {
      if (!selectedFlight || !selectedHotel) {
        return;
      }

      setIsConfirmOpen(false);
      patchCanvasState({ itineraryPhase: "generating" });
      setIsGeneratePending(true);

      await runAgentMessage(
        buildGenerateItineraryMessage({
          sketch,
          flight: selectedFlight,
          hotel: selectedHotel,
          starredPlaces,
        }),
      );
    }, [
      patchCanvasState,
      runAgentMessage,
      selectedFlight,
      selectedHotel,
      sketch,
      starredPlaces,
    ]);

  useEffect(() => {
    if (!isAgentRunning && itineraryPhase === "generating") {
      patchCanvasState({
        itineraryPhase: fullItinerary ? "full" : "sketch",
      });
    }
  }, [fullItinerary, isAgentRunning, itineraryPhase, patchCanvasState]);

  const handleCancelGenerateItinerary = useCallback((): void => {
    setIsConfirmOpen(false);
  }, []);

  return (
    <>
      {isConfirmOpen && (
        <Modal onClose={handleCancelGenerateItinerary}>
          <Confirmation
            variant="modal"
            message={generateConfirmMessage}
            onConfirm={handleConfirmGenerateItinerary}
            onCancel={handleCancelGenerateItinerary}
          />
        </Modal>
      )}

      <SyncTripToolResults setToolPatch={setToolPatch} />

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
              isSketching={isSketchPending && isAgentRunning}
              isPlanningInProgress={isPlanningInProgress}
              isSketchReady={isSketchReadyOnPlaces}
              planningMessage={PLANNING_IN_PROGRESS_MESSAGE}
              sketchReadyMessage={SKETCH_READY_ON_PLACES_MESSAGE}
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
              fullItinerary={fullItinerary}
              selectedFlight={selectedFlight}
              selectedHotel={selectedHotel}
              isReady={itineraryReadiness.isReady}
              isGenerating={isGeneratePending && isAgentRunning}
              disabledReason={disabledReason}
              onToggleDay={handleToggleDay}
              onRefreshSketch={handleRefreshSketch}
              onEditBookings={handleEditBookings}
              onGenerateItinerary={handleOpenGenerateItineraryConfirm}
            />
          )}
        </div>
      </main>
    </>
  );
};

export const TravelCanvas = memo(TravelCanvasComponent);
