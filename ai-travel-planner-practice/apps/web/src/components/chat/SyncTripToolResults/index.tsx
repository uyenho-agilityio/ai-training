"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
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
  MastraThreadMessage,
  TripBookingsToolResult,
  TripSketchToolResult,
  TripSketch,
  CheckPlacesToolResult,
  PlaceBrief,
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
  collectToolResultsFromMastraMessages,
  extractDestinationLabel,
  fetchMemoryThreadMessages,
  getToolRenderPayload,
  mergePlaces,
  mergeSketchStopsIntoPlaces,
  parseToolResult,
  resolveToolSyncKind,
  mergeTripSketches,
  shouldMergeTripSketchSegment,
} from "@/utils";
import { useConversationHistory } from "@/hooks";

type SyncTripToolResultsProps = {
  setToolPatch: Dispatch<SetStateAction<ToolDrivenCanvasPatch>>;
  allowFullItinerarySyncRef: RefObject<boolean>;
  fullItineraryAppliedRef: RefObject<boolean>;
  allowNextGenerateConfirmRef: RefObject<boolean>;
  fullItineraryResyncNonce: number;
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

type SketchSegmentState = {
  sketch: TripSketch | null;
  destinations: string[];
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
  const sketchSegmentRef = useRef<SketchSegmentState>({
    sketch: null,
    destinations: [],
  });
  const { agent } = useAgent({ agentId: copilotAgent });
  const agentRef = useRef(agent);

  useEffect((): void => {
    agentRef.current = agent;
  }, [agent]);

  const { activeConversationId, setConversationLocationTitle } =
    useConversationHistory();

  useEffect((): void => {
    sketchSegmentRef.current = { sketch: null, destinations: [] };
  }, [activeConversationId]);

  const toMastraMessageText = useCallback(
    (message: MastraThreadMessage): string => {
      const content: unknown = message.content;

      if (typeof content === "string") {
        return content.trim();
      }

      if (!content || typeof content !== "object" || Array.isArray(content)) {
        return "";
      }

      const parts = (
        content as { parts?: Array<{ type?: string; text?: string }> }
      ).parts;

      if (!Array.isArray(parts)) {
        return "";
      }

      return parts
        .filter(
          (part: { type?: string; text?: string }) =>
            part.type === "text" && typeof part.text === "string",
        )
        .map((part: { text?: string }) => part.text?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
    },
    [],
  );

  const toCopilotMessagesFromMastra = useCallback(
    (messages: readonly MastraThreadMessage[]): CopilotMessage[] => {
      const mapped: CopilotMessage[] = [];

      const sorted = [...messages].sort(
        (left: MastraThreadMessage, right: MastraThreadMessage): number => {
          const leftTime: number = left.createdAt
            ? Date.parse(left.createdAt)
            : 0;
          const rightTime: number = right.createdAt
            ? Date.parse(right.createdAt)
            : 0;
          return leftTime - rightTime;
        },
      );

      for (const message of sorted) {
        const roleRaw: string = String(message.role ?? "").toLowerCase();
        const role: string =
          roleRaw === "user" || roleRaw === "assistant" || roleRaw === "tool"
            ? roleRaw
            : "assistant";

        const text: string = toMastraMessageText(message);

        if (!text) {
          continue;
        }

        mapped.push({
          id: message.id ?? crypto.randomUUID(),
          role,
          content: text,
        } as unknown as CopilotMessage);
      }

      return mapped;
    },
    [toMastraMessageText],
  );

  const notifyDestinationFromTool = useCallback(
    (result: unknown): void => {
      const destination = extractDestinationLabel(result);

      if (destination) {
        setConversationLocationTitle(activeConversationId, destination);
      }
    },
    [activeConversationId, setConversationLocationTitle],
  );

  const applyWeatherResult = useCallback(
    (result: unknown, shouldUpdateTitle: boolean): boolean => {
      const parsed = parseToolResult<WeatherToolResult>(result);

      if (!isWeatherToolResult(parsed)) {
        return false;
      }

      const weather = mapWeatherToolResult(parsed);

      applyToolPatch(setToolPatch, { weather });

      if (shouldUpdateTitle) {
        notifyDestinationFromTool(parsed);
      }

      return true;
    },
    [notifyDestinationFromTool, setToolPatch],
  );

  const applyTripBookingsResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
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
        ...(shouldUpdateUi ? { activeTab: "book" as const } : {}),
        ...(flights.length ? { flights } : {}),
        ...(hotels.length ? { hotels } : {}),
      });

      return true;
    },
    [setToolPatch],
  );

  const applyFlightsResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
      const parsed = parseToolResult<FlightsToolResult>(result);

      if (!parsed || !Array.isArray(parsed.flights) || !parsed.flights.length) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        flights: parsed.flights,
        ...(shouldUpdateUi ? { activeTab: "book" as const } : {}),
      });

      return true;
    },
    [setToolPatch],
  );

  const applyHotelsResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
      const parsed = parseToolResult<HotelsToolResult>(result);

      if (!parsed || !Array.isArray(parsed.hotels) || !parsed.hotels.length) {
        return false;
      }

      applyToolPatch(setToolPatch, {
        hotels: parsed.hotels,
        ...(shouldUpdateUi ? { activeTab: "book" as const } : {}),
      });

      return true;
    },
    [setToolPatch],
  );

  const applyPlacesResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
      const parsed = parseToolResult<CheckPlacesToolResult>(result);

      if (!isCheckPlacesToolResult(parsed)) {
        return false;
      }

      setToolPatch((prev: ToolDrivenCanvasPatch) => {
        const agentState = agent.state as { places?: PlaceBrief[] };
        const existingPlaces: PlaceBrief[] =
          prev.places ?? agentState.places ?? [];
        // Trip-length refreshes often REPLACE with a smaller pool and wipe
        // places the user added via "find more". Keep the richer canvas list.
        const wouldShrinkReplace: boolean =
          parsed.appendToExisting !== true &&
          existingPlaces.length > parsed.places.length;
        const nextPlaces: PlaceBrief[] =
          parsed.appendToExisting === true || wouldShrinkReplace
            ? mergePlaces(existingPlaces, parsed.places)
            : parsed.places;

        return {
          ...prev,
          places: nextPlaces,
          ...(shouldUpdateUi ? { activeTab: "places" as const } : {}),
        };
      });

      if (shouldUpdateUi) {
        notifyDestinationFromTool(parsed);
      }

      return true;
    },
    [agent, notifyDestinationFromTool, setToolPatch],
  );

  const applySketchResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
      const parsed = parseToolResult<TripSketchToolResult>(result);

      if (!isTripSketchToolResult(parsed)) {
        return false;
      }

      let mergedSketch: TripSketch = parsed.sketch;
      let didMerge = false;
      const incomingDestination: string = parsed.destination.trim();
      const segmentState = sketchSegmentRef.current;
      const segmentSketch = segmentState.sketch;
      const segmentDestinations = segmentState.destinations;

      if (
        segmentSketch &&
        shouldMergeTripSketchSegment(
          segmentSketch,
          segmentDestinations,
          incomingDestination,
        )
      ) {
        const baseDestination: string =
          segmentDestinations[0] ?? incomingDestination;
        mergedSketch = mergeTripSketches(
          segmentSketch,
          parsed.sketch,
          baseDestination,
          incomingDestination,
        );
        didMerge = true;
      }

      sketchSegmentRef.current = {
        sketch: mergedSketch,
        destinations: didMerge
          ? [...segmentDestinations, incomingDestination]
          : [incomingDestination],
      };

      const expandedDays = getDefaultExpandedSketchDays(mergedSketch);
      const sketchStopCount: number = mergedSketch.days.reduce(
        (total: number, day) => total + day.stops.length,
        0,
      );

      setToolPatch((prev: ToolDrivenCanvasPatch) => {
        const agentState = agent.state as { places?: PlaceBrief[] };
        const existingPlaces: PlaceBrief[] =
          prev.places ?? agentState.places ?? [];
        const syncedPlaces: PlaceBrief[] = mergeSketchStopsIntoPlaces(
          existingPlaces,
          mergedSketch,
        );

        return {
          ...prev,
          sketch: mergedSketch,
          places: syncedPlaces,
          expandedDays,
          itineraryPhase: "sketch",
          ...(shouldUpdateUi ? { fullItinerary: null } : {}),
          ...(shouldUpdateUi ? { activeTab: "itinerary" as const } : {}),
        };
      });

      if (shouldUpdateUi) {
        notifyDestinationFromTool({
          ...parsed,
          sketch: mergedSketch,
        });
      }

      return true;
    },
    [agent, notifyDestinationFromTool, setToolPatch],
  );

  const applyFullItineraryResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): ToolApplyOutcome => {
      const parsed = parseToolResult<GenerateItineraryToolResult>(result);

      if (!isGenerateItineraryToolResult(parsed)) {
        return { applied: false, consumed: false };
      }

      // When hydrating from persisted thread history, always allow restoring full itineraries.
      // The generate-confirm modal gate only applies to live tool results.
      if (shouldUpdateUi && !allowFullItinerarySyncRef.current) {
        return { applied: false, consumed: false };
      }

      const expandedDays = getDefaultExpandedFullItineraryDays(
        parsed.itinerary,
      );
      const itinerarySegmentCount: number = parsed.itinerary.days.reduce(
        (total: number, day) => total + day.segments.length,
        0,
      );

      applyToolPatch(setToolPatch, {
        fullItinerary: parsed.itinerary,
        expandedDays,
        itineraryPhase: "full",
        ...(shouldUpdateUi ? { activeTab: "itinerary" as const } : {}),
      });

      if (shouldUpdateUi) {
        notifyDestinationFromTool(parsed);
      }

      allowFullItinerarySyncRef.current = false;
      fullItineraryAppliedRef.current = true;

      return { applied: true, consumed: true };
    },
    [
      allowFullItinerarySyncRef,
      fullItineraryAppliedRef,
      notifyDestinationFromTool,
      setToolPatch,
    ],
  );

  const applySelectBookingsResult = useCallback(
    (result: unknown, shouldUpdateUi: boolean): boolean => {
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
        ...(!isGenerateOnlyRequest && shouldUpdateUi
          ? { activeTab: "book" as const }
          : {}),
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
    (
      toolName: string,
      payload: unknown,
      shouldUpdateTitle: boolean = false,
    ) => {
      // Important: the same tool payload can appear in both:
      // - thread hydration / replay (shouldUpdateTitle=false)
      // - live tool renders (shouldUpdateTitle=true)
      // If we dedupe only by toolName+payload, live updates can be skipped even when the user expects
      // the canvas to refresh (e.g. "make it 3 days").
      const payloadKey = `${shouldUpdateTitle ? "live" : "replay"}:${toolName}:${JSON.stringify(payload)}`;

      if (syncedPayloadKeysRef.current.has(payloadKey)) {
        return;
      }

      let applied = false;
      let consumed = false;
      const syncKind = resolveToolSyncKind(toolName);

      switch (syncKind) {
        case "tripBookings":
          applied = applyTripBookingsResult(payload, shouldUpdateTitle);
          break;
        case "flights":
          applied = applyFlightsResult(payload, shouldUpdateTitle);
          break;
        case "hotels":
          applied = applyHotelsResult(payload, shouldUpdateTitle);
          break;
        case "weather":
          applied = applyWeatherResult(payload, shouldUpdateTitle);
          break;
        case "places":
          applied = applyPlacesResult(payload, shouldUpdateTitle);
          break;
        case "sketch":
          applied = applySketchResult(payload, shouldUpdateTitle);
          break;
        case "fullItinerary": {
          const outcome = applyFullItineraryResult(payload, shouldUpdateTitle);
          applied = outcome.applied;
          consumed = outcome.consumed;
          break;
        }
        case "selectBookings":
          applied = applySelectBookingsResult(payload, shouldUpdateTitle);
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
        syncToolPayload(toolName, payload, true);
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

  const lastSyncedMessagesRef = useRef<string>("");

  /** Reset sketch segment tracking before replaying tool history. */
  const resetSketchSegmentReplay = useCallback((): void => {
    sketchSegmentRef.current = { sketch: null, destinations: [] };

    for (const key of [...syncedPayloadKeysRef.current]) {
      const separatorIndex: number = key.indexOf(":");

      if (separatorIndex === -1) {
        continue;
      }

      const toolName: string = key.slice(0, separatorIndex);

      if (resolveToolSyncKind(toolName) === "sketch") {
        syncedPayloadKeysRef.current.delete(key);
      }
    }
  }, []);

  /** v2 agent stream — only sync live messages for the active thread. */
  const syncAgentToolMessages = useCallback((): void => {
    if (agent.threadId !== activeConversationId) {
      return;
    }

    if (!agent.messages.length) {
      return;
    }

    const messageFingerprint = agent.messages
      .map((message) => message.id)
      .join("|");

    if (messageFingerprint === lastSyncedMessagesRef.current) {
      return;
    }

    lastSyncedMessagesRef.current = messageFingerprint;

    const toolResults = collectToolResultMessages(
      agent.messages as CopilotMessage[],
    );

    resetSketchSegmentReplay();

    for (const { toolName, payload } of toolResults) {
      // Agent messages are the live stream for the active thread, so treat them as live updates.
      // Otherwise, replay-mode syncing can overwrite the latest live tool render state.
      syncToolPayload(toolName, payload, true);
    }
  }, [
    activeConversationId,
    agent.messages,
    agent.threadId,
    resetSketchSegmentReplay,
    syncToolPayload,
  ]);

  /** Restore canvas from persisted Mastra messages when switching threads only. */
  useEffect(() => {
    let cancelled = false;

    syncedPayloadKeysRef.current.clear();
    lastSyncedMessagesRef.current = "";

    const hydrateCanvasFromThread = async (): Promise<void> => {
      try {
        const messages = await fetchMemoryThreadMessages(activeConversationId);

        if (cancelled) {
          return;
        }

        const toolResults = collectToolResultsFromMastraMessages(messages);
        const chatMessages = toCopilotMessagesFromMastra(messages);
        const liveAgent = agentRef.current;

        if (typeof liveAgent.setMessages === "function") {
          try {
            type AgentSetMessages = typeof liveAgent.setMessages;
            type AgentMessagesArg = AgentSetMessages extends (
              arg: infer Arg,
            ) => unknown
              ? Arg
              : never;

            const nextMessages: AgentMessagesArg =
              chatMessages as unknown as AgentMessagesArg;

            liveAgent.setMessages(nextMessages);
          } catch {
            // ignore hydrate failures
          }
        }

        resetSketchSegmentReplay();

        for (const { toolName, payload } of toolResults) {
          const kind = resolveToolSyncKind(toolName);

          if (kind === "fullItinerary") {
            allowFullItinerarySyncRef.current = true;
          }

          syncToolPayload(toolName, payload, false);
        }

        lastSyncedMessagesRef.current = liveAgent.messages
          .map((message) => message.id)
          .join("|");
      } catch {
        // ignore hydrate failures
      }
    };

    hydrateCanvasFromThread();

    return () => {
      cancelled = true;
    };
  }, [
    activeConversationId,
    allowFullItinerarySyncRef,
    resetSketchSegmentReplay,
    syncToolPayload,
    toCopilotMessagesFromMastra,
  ]);

  useEffect(() => {
    onRegisterSyncAgentToolMessages?.(syncAgentToolMessages);
  }, [onRegisterSyncAgentToolMessages, syncAgentToolMessages]);

  useEffect(() => {
    if (fullItineraryResyncNonce === 0) {
      return;
    }

    lastSyncedMessagesRef.current = "";
    syncAgentToolMessages();
  }, [fullItineraryResyncNonce, syncAgentToolMessages]);

  useEffect(() => {
    if (suggestGenerateResyncNonce === 0) {
      return;
    }

    clearSuggestGenerateSelectBookingsCache(syncedPayloadKeysRef.current);
  }, [suggestGenerateResyncNonce]);

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
