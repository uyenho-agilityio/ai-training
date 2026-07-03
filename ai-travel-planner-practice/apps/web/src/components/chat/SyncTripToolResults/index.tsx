"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";

import {
  useRenderToolCall,
  type ActionRenderPropsNoArgs,
} from "@copilotkit/react-core";
import { useAgent } from "@copilotkit/react-core/v2";

import { copilotAgent } from "@/constants";
import type {
  FlightsToolResult,
  HotelsToolResult,
  ToolDrivenCanvasPatch,
  CopilotMessage,
  TripBookingsToolResult,
  TripSketchToolResult,
  CheckPlacesToolResult,
  GenerateItineraryToolResult,
  SelectBookingsToolResult,
  WeatherToolResult,
} from "@/types";
import {
  getDefaultExpandedFullItineraryDays,
  getDefaultExpandedSketchDays,
  isCheckPlacesToolResult,
  isGenerateItineraryToolResult,
  isSelectBookingsToolResult,
  isTripSketchToolResult,
  mapWeatherToolResult,
  isWeatherToolResult,
  collectToolResultMessages,
  getToolRenderPayload,
  parseToolResult,
  resolveToolSyncKind,
} from "@/utils";

type SyncTripToolResultsProps = {
  setToolPatch: Dispatch<SetStateAction<ToolDrivenCanvasPatch>>;
};

type ToolRenderProps = ActionRenderPropsNoArgs & {
  name?: string;
  output?: unknown;
};

/** Tool-driven canvas updates live in toolPatch so co-agent resets cannot wipe them. */
const applyToolPatch = (
  setToolPatch: SyncTripToolResultsProps["setToolPatch"],
  patch: ToolDrivenCanvasPatch,
): void => {
  setToolPatch((prev: ToolDrivenCanvasPatch) => ({
    ...prev,
    ...patch,
  }));
};

const SyncTripToolResultsComponent = ({
  setToolPatch,
}: SyncTripToolResultsProps): null => {
  const syncedPayloadKeysRef = useRef<Set<string>>(new Set());

  const applyWeatherResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<WeatherToolResult>(result);

      if (!isWeatherToolResult(parsed)) {
        return false;
      }

      const weather = mapWeatherToolResult(parsed);

      applyToolPatch(setToolPatch, { weather });

      return true;
    },
    [setToolPatch],
  );

  const applyTripBookingsResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<TripBookingsToolResult>(result);

      if (!parsed) {
        return false;
      }

      if (!Array.isArray(parsed.flights) && !Array.isArray(parsed.hotels)) {
        return false;
      }

      const flights = Array.isArray(parsed.flights) ? parsed.flights : [];
      const hotels = Array.isArray(parsed.hotels) ? parsed.hotels : [];

      if (!flights.length && !hotels.length) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        activeTab: "book",
        ...(flights.length ? { flights } : {}),
        ...(hotels.length ? { hotels } : {}),
      });

      return true;
    },
    [setToolPatch],
  );

  const applyFlightsResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<FlightsToolResult>(result);

      if (!parsed || !Array.isArray(parsed.flights) || !parsed.flights.length) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        flights: parsed.flights,
        activeTab: "book",
      });

      return true;
    },
    [setToolPatch],
  );

  const applyHotelsResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<HotelsToolResult>(result);

      if (!parsed || !Array.isArray(parsed.hotels) || !parsed.hotels.length) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        hotels: parsed.hotels,
        activeTab: "book",
      });

      return true;
    },
    [setToolPatch],
  );

  const applyPlacesResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<CheckPlacesToolResult>(result);

      if (!isCheckPlacesToolResult(parsed)) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        places: parsed.places,
        activeTab: "places",
      });

      return true;
    },
    [setToolPatch],
  );

  const applySketchResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<TripSketchToolResult>(result);

      if (!isTripSketchToolResult(parsed)) {
        return false;
      }

      const expandedDays = getDefaultExpandedSketchDays(parsed.sketch);

      applyToolPatch(setToolPatch, {
        sketch: parsed.sketch,
        expandedDays,
        itineraryPhase: "sketch",
        fullItinerary: null,
        activeTab: "itinerary",
      });

      return true;
    },
    [setToolPatch],
  );

  const applyFullItineraryResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<GenerateItineraryToolResult>(result);

      if (!isGenerateItineraryToolResult(parsed)) {
        return false;
      }

      const expandedDays = getDefaultExpandedFullItineraryDays(
        parsed.itinerary,
      );

      applyToolPatch(setToolPatch, {
        fullItinerary: parsed.itinerary,
        expandedDays,
        itineraryPhase: "full",
        activeTab: "itinerary",
      });

      return true;
    },
    [setToolPatch],
  );

  const applySelectBookingsResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<SelectBookingsToolResult>(result);

      if (!isSelectBookingsToolResult(parsed)) {
        return false;
      }

      const toolPatch: ToolDrivenCanvasPatch = {
        activeTab: "book",
        ...(parsed.selectedFlightId != null
          ? { selectedFlightId: parsed.selectedFlightId }
          : {}),
        ...(parsed.selectedHotelId != null
          ? { selectedHotelId: parsed.selectedHotelId }
          : {}),
        ...(parsed.suggestGenerateItinerary ? { isGenerateConfirm: true } : {}),
      };

      applyToolPatch(setToolPatch, toolPatch);

      return true;
    },
    [setToolPatch],
  );

  const syncToolPayload = useCallback(
    (toolName: string, payload: unknown) => {
      const payloadKey = `${toolName}:${JSON.stringify(payload)}`;

      if (syncedPayloadKeysRef.current.has(payloadKey)) {
        return;
      }

      let applied = false;

      switch (resolveToolSyncKind(toolName)) {
        case "tripBookings":
          applied = applyTripBookingsResult(payload);
          break;
        case "flights":
          applied = applyFlightsResult(payload);
          break;
        case "hotels":
          applied = applyHotelsResult(payload);
          break;
        case "weather":
          applied = applyWeatherResult(payload);
          break;
        case "places":
          applied = applyPlacesResult(payload);
          break;
        case "sketch":
          applied = applySketchResult(payload);
          break;
        case "fullItinerary":
          applied = applyFullItineraryResult(payload);
          break;
        case "selectBookings":
          applied = applySelectBookingsResult(payload);
          break;
        default:
          break;
      }

      if (applied) {
        syncedPayloadKeysRef.current.add(payloadKey);
      }
    },
    [
      applyTripBookingsResult,
      applyFlightsResult,
      applyHotelsResult,
      applyWeatherResult,
      applyPlacesResult,
      applySketchResult,
      applyFullItineraryResult,
      applySelectBookingsResult,
    ],
  );

  const handleWildcardToolRender = useCallback(
    (props: ToolRenderProps): ReactElement => {
      if (props.status !== "complete") {
        return <></>;
      }

      const toolName = props.name ?? "";
      const payload = getToolRenderPayload(props);

      if (!toolName || payload == null) {
        return <></>;
      }

      queueMicrotask(() => {
        syncToolPayload(toolName, payload);
      });

      return <></>;
    },
    [syncToolPayload],
  );

  useRenderToolCall({
    name: "*",
    parameters: [],
    render: handleWildcardToolRender,
  });

  const { agent } = useAgent({ agentId: copilotAgent });

  /** v2 agent stream — not legacy useCopilotMessagesContext (stays empty in agent mode). */
  const syncAgentToolMessages = useCallback((): void => {
    if (!agent.messages.length) {
      return;
    }

    const toolResults = collectToolResultMessages(
      agent.messages as CopilotMessage[],
    );

    for (const { toolName, payload } of toolResults) {
      syncToolPayload(toolName, payload);
    }
  }, [agent.messages, syncToolPayload]);

  useEffect(() => {
    syncAgentToolMessages();
  }, [syncAgentToolMessages]);

  useEffect(() => {
    const subscription = agent.subscribe({
      onMessagesChanged: () => {
        syncAgentToolMessages();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [agent, syncAgentToolMessages]);

  return null;
};

export const SyncTripToolResults = memo(SyncTripToolResultsComponent);
