"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
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
  allowFullItinerarySyncRef: MutableRefObject<boolean>;
  fullItineraryAppliedRef: MutableRefObject<boolean>;
  /** When false, blocks suggest-generate selectBookings from reopening the modal after cancel. */
  allowNextGenerateConfirmRef: MutableRefObject<boolean>;
  /** Increment after modal confirm to re-sync generate-itinerary tool results. */
  fullItineraryResyncNonce: number;
  /** Increment when the generate modal is canceled so cached selectBookings can reopen it. */
  suggestGenerateResyncNonce: number;
  onRegisterSyncAgentToolMessages?: (sync: () => void) => void;
};

type ToolApplyOutcome = {
  applied: boolean;
  consumed: boolean;
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

/** Drop cached selectBookings suggest-generate payloads after modal cancel. */
const clearSuggestGenerateSelectBookingsCache = (
  cachedKeys: Set<string>,
): number => {
  let removedCount: number = 0;

  for (const key of [...cachedKeys]) {
    const separatorIndex: number = key.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const toolName: string = key.slice(0, separatorIndex);

    if (resolveToolSyncKind(toolName) !== "selectBookings") {
      continue;
    }

    if (!key.includes("suggestGenerateItinerary")) {
      continue;
    }

    cachedKeys.delete(key);
    removedCount += 1;
  }

  return removedCount;
};

const SyncTripToolResultsComponent = ({
  setToolPatch,
  allowFullItinerarySyncRef,
  fullItineraryAppliedRef,
  allowNextGenerateConfirmRef,
  fullItineraryResyncNonce,
  suggestGenerateResyncNonce,
  onRegisterSyncAgentToolMessages,
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
    (result: unknown): ToolApplyOutcome => {
      const parsed = parseToolResult<GenerateItineraryToolResult>(result);

      if (!isGenerateItineraryToolResult(parsed)) {
        return { applied: false, consumed: false };
      }

      if (!allowFullItinerarySyncRef.current) {
        return { applied: false, consumed: false };
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

      allowFullItinerarySyncRef.current = false;
      fullItineraryAppliedRef.current = true;

      return { applied: true, consumed: true };
    },
    [allowFullItinerarySyncRef, fullItineraryAppliedRef, setToolPatch],
  );

  const applySelectBookingsResult = useCallback(
    (result: unknown): boolean => {
      const parsed = parseToolResult<SelectBookingsToolResult>(result);

      if (!isSelectBookingsToolResult(parsed)) {
        return false;
      }

      const isGenerateOnlyRequest: boolean =
        Boolean(parsed.suggestGenerateItinerary) && !parsed.readinessBlocked;

      const willOpenGenerateConfirm: boolean =
        isGenerateOnlyRequest &&
        !allowFullItinerarySyncRef.current &&
        allowNextGenerateConfirmRef.current;

      if (willOpenGenerateConfirm) {
        allowNextGenerateConfirmRef.current = false;
      }

      const toolPatch: ToolDrivenCanvasPatch = {
        ...(!isGenerateOnlyRequest ? { activeTab: "book" as const } : {}),
        ...(!isGenerateOnlyRequest && parsed.selectedFlightId != null
          ? { selectedFlightId: parsed.selectedFlightId }
          : {}),
        ...(!isGenerateOnlyRequest && parsed.selectedHotelId != null
          ? { selectedHotelId: parsed.selectedHotelId }
          : {}),
        ...(willOpenGenerateConfirm ? { isGenerateConfirm: true } : {}),
      };

      applyToolPatch(setToolPatch, toolPatch);

      return true;
    },
    [allowFullItinerarySyncRef, allowNextGenerateConfirmRef, setToolPatch],
  );

  const syncToolPayload = useCallback(
    (toolName: string, payload: unknown) => {
      const payloadKey = `${toolName}:${JSON.stringify(payload)}`;

      if (syncedPayloadKeysRef.current.has(payloadKey)) {
        return;
      }

      let applied = false;
      let consumed = false;

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
        case "fullItinerary": {
          const outcome = applyFullItineraryResult(payload);
          applied = outcome.applied;
          consumed = outcome.consumed;
          break;
        }
        case "selectBookings":
          applied = applySelectBookingsResult(payload);
          break;
        default:
          break;
      }

      if (applied || consumed) {
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
    onRegisterSyncAgentToolMessages?.(syncAgentToolMessages);
  }, [onRegisterSyncAgentToolMessages, syncAgentToolMessages]);

  useEffect(() => {
    if (fullItineraryResyncNonce === 0) {
      return;
    }

    syncAgentToolMessages();
  }, [fullItineraryResyncNonce, syncAgentToolMessages]);

  useEffect(() => {
    if (suggestGenerateResyncNonce === 0) {
      return;
    }

    clearSuggestGenerateSelectBookingsCache(syncedPayloadKeysRef.current);
  }, [suggestGenerateResyncNonce]);

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
