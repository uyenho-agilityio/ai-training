"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";

import { flushSync } from "react-dom";

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
  GENERATE_FULL_ITINERARY_MESSAGE,
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
  buildCanvasItineraryDeclinedMessage,
  buildGenerateItineraryConfirmMessage,
  buildGenerateItineraryMessage,
  buildSketchFromStarredMessage,
  dismissPlace,
  filterPlacesByStatus,
  findBookingById,
  getGenerateItineraryReadiness,
  mergeCanvasState,
  registerTravelCanvasBridge,
  resolveBookingSelectionIds,
  togglePlaceStar,
  updateMemoryThreadWorkingMemory,
  parseWorkingMemoryFromMetadata,
  fetchMemoryThread,
  extractDestinationFromSketch,
} from "@/utils";
import { CANVAS_TABS } from "@/constants";
import { useConversationHistory, useRunAgentMessage } from "@/hooks";
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
  const { activeConversationId } = useConversationHistory();
  const {
    state,
    setState,
    running: isAgentRunning,
  } = useCoAgent<TripCanvasState>({
    name: copilotAgent,
    initialState: INITIAL_TRIP_STATE,
  });

  const setCoAgentStateRef = useRef<typeof setState>(setState);

  useEffect((): void => {
    setCoAgentStateRef.current = setState;
  }, [setState]);

  const { appendUserChatMessage, runAgentMessage } = useRunAgentMessage();

  const [toolPatch, setToolPatch] = useState<ToolDrivenCanvasPatch>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSketchPending, setIsSketchPending] = useState<boolean>(false);
  const [isGeneratePending, setIsGeneratePending] = useState<boolean>(false);
  const [fullItineraryResyncNonce, setFullItineraryResyncNonce] =
    useState<number>(0);
  const [suggestGenerateResyncNonce, setSuggestGenerateResyncNonce] =
    useState<number>(0);
  /** Only true after user confirms the generate-itinerary modal — blocks premature agent tool sync. */
  const allowFullItinerarySyncRef = useRef<boolean>(false);
  const fullItineraryAppliedRef = useRef<boolean>(false);
  const generateConfirmSourceRef = useRef<"chat" | "button">("button");
  /** False after modal cancel — blocks stale agent sync from reopening until user retries. */
  const allowNextGenerateConfirmRef = useRef<boolean>(false);
  /** Ref mirror of isConfirmOpen — avoids stale bridge closures in chat input. */
  const isConfirmOpenRef = useRef<boolean>(false);
  /** True from make-it-real / modal open until user confirms or cancels. */
  const generateConfirmPendingRef = useRef<boolean>(false);
  const syncAgentToolMessagesRef = useRef<(() => void) | null>(null);
  /** True after first workingMemory hydrate attempt for the active thread. */
  const hasHydratedWorkingMemoryRef = useRef<boolean>(false);
  /** Last non-null booking picks — survives co-agent state resets during agent runs. */
  const lastBookingSelectionRef = useRef<{
    flightId: string | null;
    hotelId: string | null;
  }>({ flightId: null, hotelId: null });

  const handleRegisterSyncAgentToolMessages = useCallback(
    (sync: () => void): void => {
      syncAgentToolMessagesRef.current = sync;
    },
    [],
  );

  useEffect(() => {
    if (!isAgentRunning) {
      setIsSketchPending(false);
      setIsGeneratePending(false);
    }
  }, [isAgentRunning]);

  /** Block generate-confirm modal from stale co-agent memory or replayed tool results on load. */
  useEffect(() => {
    allowNextGenerateConfirmRef.current = false;
    generateConfirmPendingRef.current = false;
    setToolPatch(
      (previous: ToolDrivenCanvasPatch): ToolDrivenCanvasPatch =>
        previous.isGenerateConfirm
          ? { ...previous, isGenerateConfirm: false }
          : previous,
    );
    setCoAgentStateRef.current(
      (previous: TripCanvasState | undefined): TripCanvasState => {
        if (!previous?.isGenerateConfirm) {
          return previous ?? INITIAL_TRIP_STATE;
        }

        return { ...previous, isGenerateConfirm: false };
      },
    );
  }, []);

  const canvasState = useMemo(
    (): TripCanvasState => mergeCanvasState(state, toolPatch),
    [state, toolPatch],
  );

  useEffect((): void => {
    if (isAgentRunning) {
      return;
    }

    const hasToolPatchData: boolean = TOOL_PATCH_MIRROR_KEYS.some(
      (key: keyof ToolDrivenCanvasPatch) => toolPatch[key] !== undefined,
    );

    if (!hasToolPatchData) {
      return;
    }

    setCoAgentStateRef.current(
      (previous: TripCanvasState | undefined): TripCanvasState => {
        const merged: TripCanvasState = mergeCanvasState(previous, toolPatch);
        const resolved: TripCanvasState = previous ?? INITIAL_TRIP_STATE;
        const toolPatchHasSketch: boolean =
          toolPatch.sketch !== undefined &&
          (toolPatch.sketch.days?.length ?? 0) > 0;

        const lostCanvasData: boolean =
          toolPatchHasSketch ||
          (merged.places?.length ?? 0) > (resolved.places?.length ?? 0) ||
          (merged.sketch?.days?.length ?? 0) >
            (resolved.sketch?.days?.length ?? 0) ||
          (merged.flights?.length ?? 0) > (resolved.flights?.length ?? 0) ||
          (merged.hotels?.length ?? 0) > (resolved.hotels?.length ?? 0);

        if (!lostCanvasData) {
          return resolved;
        }

        return {
          ...merged,
          activeTab: resolved.activeTab,
          placeFilter: resolved.placeFilter,
        };
      },
    );
  }, [isAgentRunning, toolPatch]);

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

  const patchState = useCallback((patch: Partial<TripCanvasState>) => {
    setCoAgentStateRef.current((prev: TripCanvasState | undefined) => ({
      ...(prev ?? INITIAL_TRIP_STATE),
      ...patch,
    }));
  }, []);

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

      const next: ToolDrivenCanvasPatch = { ...prev };
      delete next.activeTab;
      return next;
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

    patchCanvasState({ places });

    setIsSketchPending(true);
    await runAgentMessage(buildSketchFromStarredMessage(starredPlaces));
  }, [patchCanvasState, places, runAgentMessage, starredPlaces]);

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
    (id: string): void => {
      const nextId: string | null = selectedFlightId === id ? null : id;
      patchCanvasState({ selectedFlightId: nextId });
    },
    [patchCanvasState, selectedFlightId],
  );

  const handleSelectHotel = useCallback(
    (id: string): void => {
      const nextId: string | null = selectedHotelId === id ? null : id;
      patchCanvasState({ selectedHotelId: nextId });
    },
    [patchCanvasState, selectedHotelId],
  );

  /**
   * Hydrate co-agent state from Mastra thread workingMemory.
   * This avoids any window/localStorage dependency and persists across devices.
   */
  useEffect(() => {
    let didCancel = false;
    hasHydratedWorkingMemoryRef.current = false;
    lastBookingSelectionRef.current = { flightId: null, hotelId: null };

    const hydrateWorkingMemory = async (): Promise<void> => {
      try {
        const thread = await fetchMemoryThread(activeConversationId);
        const workingMemory = parseWorkingMemoryFromMetadata(thread.metadata);

        if (didCancel) {
          return;
        }

        if (!workingMemory) {
          hasHydratedWorkingMemoryRef.current = true;
          return;
        }

        if (workingMemory.selectedFlightId) {
          lastBookingSelectionRef.current.flightId =
            workingMemory.selectedFlightId;
        }

        if (workingMemory.selectedHotelId) {
          lastBookingSelectionRef.current.hotelId =
            workingMemory.selectedHotelId;
        }

        setCoAgentStateRef.current(
          (previous: TripCanvasState | undefined): TripCanvasState => {
            const resolved: TripCanvasState = previous ?? INITIAL_TRIP_STATE;
            const { activeTab: _savedTab, ...restoredState } = workingMemory;

            return {
              ...resolved,
              ...restoredState,
              activeTab: resolved.activeTab,
            };
          },
        );
      } catch {
        // If hydration fails, keep the current in-memory state.
      } finally {
        if (!didCancel) {
          hasHydratedWorkingMemoryRef.current = true;
        }
      }
    };

    hydrateWorkingMemory();

    return (): void => {
      didCancel = true;
    };
  }, [activeConversationId]);

  /**
   * Persist the booking selections to Mastra thread metadata.
   * Debounced to avoid hammering the memory API during fast UI updates.
   */
  useEffect(() => {
    if (!hasHydratedWorkingMemoryRef.current) {
      return;
    }

    const isBlankCanvas: boolean =
      selectedFlightId == null &&
      selectedHotelId == null &&
      (canvasState.flights?.length ?? 0) === 0 &&
      (canvasState.hotels?.length ?? 0) === 0 &&
      (canvasState.places?.length ?? 0) === 0 &&
      !canvasState.fullItinerary;

    // Avoid wiping richer thread memory with the INITIAL empty canvas on boot.
    if (isBlankCanvas) {
      return;
    }

    const timeoutMs: number = 400;

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      const persist = async (): Promise<void> => {
        try {
          const nextWorkingMemory: TripCanvasState = {
            ...canvasState,
            selectedFlightId,
            selectedHotelId,
          };

          await updateMemoryThreadWorkingMemory(
            activeConversationId,
            nextWorkingMemory,
          );
        } catch {
          // Ignore persistence failures; selection will still work in-session.
        }
      };

      persist();
    }, timeoutMs);

    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [activeConversationId, canvasState, selectedFlightId, selectedHotelId]);

  /** Remember non-null booking picks so agent runs cannot lose them permanently. */
  useEffect(() => {
    if (selectedFlightId) {
      lastBookingSelectionRef.current.flightId = selectedFlightId;
    }

    if (selectedHotelId) {
      lastBookingSelectionRef.current.hotelId = selectedHotelId;
    }
  }, [selectedFlightId, selectedHotelId]);

  /** Restore booking picks cleared when CopilotKit replaces co-agent state mid-run. */
  useEffect(() => {
    if (isAgentRunning) {
      return;
    }

    const rememberedFlightId = lastBookingSelectionRef.current.flightId;
    const rememberedHotelId = lastBookingSelectionRef.current.hotelId;
    const nextFlightId =
      selectedFlightId ??
      (rememberedFlightId &&
      flights.some((flight) => flight.id === rememberedFlightId)
        ? rememberedFlightId
        : null);
    const nextHotelId =
      selectedHotelId ??
      (rememberedHotelId &&
      hotels.some((hotel) => hotel.id === rememberedHotelId)
        ? rememberedHotelId
        : null);

    if (nextFlightId === selectedFlightId && nextHotelId === selectedHotelId) {
      return;
    }

    if (!nextFlightId && !nextHotelId) {
      return;
    }

    patchCanvasState({
      selectedFlightId: nextFlightId,
      selectedHotelId: nextHotelId,
    });
  }, [
    flights,
    hotels,
    isAgentRunning,
    patchCanvasState,
    selectedFlightId,
    selectedHotelId,
  ]);
  const handleEditBookings = useCallback(() => {
    navigateToTab("book");
  }, [navigateToTab]);

  const handleViewSketch = useCallback(() => {
    navigateToTab("itinerary");
  }, [navigateToTab]);

  /** Sync resolved Book tab selections to co-agent before generate-itinerary flows. */
  const ensureResolvedBookingSelections = useCallback((): {
    flightId: string | null;
    hotelId: string | null;
  } => {
    const { flightId, hotelId } = resolveBookingSelectionIds(
      flights,
      hotels,
      selectedFlightId,
      selectedHotelId,
    );

    if (
      flightId &&
      hotelId &&
      (flightId !== selectedFlightId || hotelId !== selectedHotelId)
    ) {
      patchCanvasState({
        selectedFlightId: flightId,
        selectedHotelId: hotelId,
      });
    }

    return { flightId, hotelId };
  }, [flights, hotels, patchCanvasState, selectedFlightId, selectedHotelId]);

  const handleOpenGenerateItineraryConfirm = useCallback(
    (source: "chat" | "button" = "button"): void => {
      const { flightId: resolvedFlightId, hotelId: resolvedHotelId } =
        ensureResolvedBookingSelections();

      if (
        !resolvedFlightId ||
        !resolvedHotelId ||
        !itineraryReadiness.isReady
      ) {
        return;
      }

      generateConfirmSourceRef.current = source;
      allowFullItinerarySyncRef.current = false;
      generateConfirmPendingRef.current = true;
      isConfirmOpenRef.current = true;
      setIsConfirmOpen(true);
    },
    [ensureResolvedBookingSelections, itineraryReadiness.isReady],
  );

  const handleConfirmGenerateItinerary =
    useCallback(async (): Promise<void> => {
      const { flightId, hotelId } = ensureResolvedBookingSelections();
      const resolvedFlight: FlightData | null = findBookingById<FlightData>(
        flights,
        flightId,
      );
      const resolvedHotel: HotelData | null = findBookingById<HotelData>(
        hotels,
        hotelId,
      );

      if (!resolvedFlight || !resolvedHotel) {
        return;
      }

      generateConfirmPendingRef.current = false;
      isConfirmOpenRef.current = false;
      setIsConfirmOpen(false);
      fullItineraryAppliedRef.current = false;

      const visibleInChat: boolean =
        generateConfirmSourceRef.current === "button";

      if (visibleInChat) {
        appendUserChatMessage(GENERATE_FULL_ITINERARY_MESSAGE);
      }

      allowFullItinerarySyncRef.current = true;
      syncAgentToolMessagesRef.current?.();

      const appliedFromCachedToolResult: boolean =
        !allowFullItinerarySyncRef.current;

      if (appliedFromCachedToolResult) {
        patchCanvasState({ activeTab: "itinerary" });
        return;
      }

      allowFullItinerarySyncRef.current = true;
      setFullItineraryResyncNonce(
        (previousNonce: number): number => previousNonce + 1,
      );
      patchCanvasState({ itineraryPhase: "generating" });
      setIsGeneratePending(true);

      flushSync((): void => {
        patchCanvasState({
          selectedFlightId: flightId,
          selectedHotelId: hotelId,
        });
      });

      lastBookingSelectionRef.current = {
        flightId,
        hotelId,
      };

      // Chat confirm: append hidden prefixed message to agent thread (filtered from UI).
      // Button confirm: visible message already appended above — skip duplicate.
      await runAgentMessage(
        buildGenerateItineraryMessage(visibleInChat, flightId, hotelId),
        {
          appendUserMessage: !visibleInChat,
        },
      );

      // Agent runs can reset co-agent state — re-apply booking picks after the run.
      patchCanvasState({
        selectedFlightId: flightId,
        selectedHotelId: hotelId,
      });

      allowFullItinerarySyncRef.current = true;
      syncAgentToolMessagesRef.current?.();

      if (fullItineraryAppliedRef.current) {
        patchCanvasState({ activeTab: "itinerary" });
      } else {
        patchCanvasState({ itineraryPhase: "sketch" });
      }

      setIsGeneratePending(false);
    }, [
      appendUserChatMessage,
      ensureResolvedBookingSelections,
      flights,
      hotels,
      patchCanvasState,
      runAgentMessage,
    ]);

  useEffect(() => {
    isConfirmOpenRef.current = isConfirmOpen;
  }, [isConfirmOpen]);

  const handleReopenGenerateItineraryConfirm = useCallback((): boolean => {
    if (!itineraryReadiness.isReady) {
      return false;
    }

    const { flightId, hotelId } = ensureResolvedBookingSelections();

    if (!flightId || !hotelId) {
      return false;
    }

    handleOpenGenerateItineraryConfirm("chat");
    return true;
  }, [
    ensureResolvedBookingSelections,
    handleOpenGenerateItineraryConfirm,
    itineraryReadiness.isReady,
  ]);

  /** Clear sketch/generate spinners and exit generating phase when the user stops the agent. */
  const handleStopActiveAgentRun = useCallback((): void => {
    setIsSketchPending(false);
    setIsGeneratePending(false);
    allowFullItinerarySyncRef.current = false;

    setCoAgentStateRef.current(
      (previous: TripCanvasState | undefined): TripCanvasState => {
        const current: TripCanvasState = previous ?? INITIAL_TRIP_STATE;

        if (current.itineraryPhase !== "generating") {
          return current;
        }

        return {
          ...current,
          itineraryPhase: current.fullItinerary ? "full" : "sketch",
        };
      },
    );
  }, [itineraryPhase, places.length, sketch?.days?.length, sketch?.title]);

  useEffect(() => {
    registerTravelCanvasBridge({
      isGenerateItineraryReady: (): boolean => {
        if (!itineraryReadiness.isReady) {
          return false;
        }

        const { flightId, hotelId } = ensureResolvedBookingSelections();

        return Boolean(flightId && hotelId);
      },
      openGenerateItineraryConfirm: (): void => {
        allowFullItinerarySyncRef.current = false;
        handleOpenGenerateItineraryConfirm("chat");
      },
      armGenerateConfirmFromAgent: (): void => {
        ensureResolvedBookingSelections();
        allowNextGenerateConfirmRef.current = true;
      },
      isGenerateConfirmModalOpen: (): boolean => isConfirmOpenRef.current,
      isGenerateConfirmPending: (): boolean =>
        generateConfirmPendingRef.current,
      confirmGenerateItineraryModalFromChat: (): void => {
        handleConfirmGenerateItinerary();
      },
      reopenGenerateItineraryConfirm: (): boolean =>
        handleReopenGenerateItineraryConfirm(),
      stopActiveAgentRun: (): void => {
        handleStopActiveAgentRun();
      },
      getAuthoritativeTripContext: () => ({
        tripDays: sketch?.days?.length ?? 0,
        destination: extractDestinationFromSketch(sketch),
        sketchTitle: sketch?.title ?? "",
        sketch: sketch ?? null,
        places,
      }),
    });

    return (): void => {
      registerTravelCanvasBridge(null);
    };
  }, [
    ensureResolvedBookingSelections,
    handleConfirmGenerateItinerary,
    handleOpenGenerateItineraryConfirm,
    handleReopenGenerateItineraryConfirm,
    handleStopActiveAgentRun,
    itineraryReadiness.isReady,
    places,
    sketch,
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
    if (!isGenerateConfirm || isConfirmOpen) {
      return;
    }

    if (!itineraryReadiness.isReady) {
      return;
    }

    const { flightId, hotelId } = ensureResolvedBookingSelections();

    if (!flightId || !hotelId) {
      return;
    }

    patchCanvasState({ isGenerateConfirm: false });
    handleOpenGenerateItineraryConfirm("chat");
  }, [
    ensureResolvedBookingSelections,
    handleOpenGenerateItineraryConfirm,
    isConfirmOpen,
    itineraryReadiness.isReady,
    patchCanvasState,
    isGenerateConfirm,
  ]);

  useEffect(() => {
    if (!isAgentRunning && itineraryPhase === "generating") {
      patchCanvasState({
        itineraryPhase: fullItinerary ? "full" : "sketch",
      });
    }
  }, [fullItinerary, isAgentRunning, itineraryPhase, patchCanvasState]);

  const handleCancelGenerateItinerary = useCallback((): void => {
    allowFullItinerarySyncRef.current = false;
    allowNextGenerateConfirmRef.current = false;
    generateConfirmPendingRef.current = false;
    isConfirmOpenRef.current = false;
    setIsConfirmOpen(false);
    patchCanvasState({ isGenerateConfirm: false });
    setSuggestGenerateResyncNonce(
      (previousNonce: number): number => previousNonce + 1,
    );

    if (generateConfirmSourceRef.current === "chat") {
      appendUserChatMessage(buildCanvasItineraryDeclinedMessage());
    }
  }, [appendUserChatMessage, patchCanvasState]);

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

      <SyncTripToolResults
        setToolPatch={setToolPatch}
        allowFullItinerarySyncRef={allowFullItinerarySyncRef}
        fullItineraryAppliedRef={fullItineraryAppliedRef}
        allowNextGenerateConfirmRef={allowNextGenerateConfirmRef}
        fullItineraryResyncNonce={fullItineraryResyncNonce}
        suggestGenerateResyncNonce={suggestGenerateResyncNonce}
        onRegisterSyncAgentToolMessages={handleRegisterSyncAgentToolMessages}
      />

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
