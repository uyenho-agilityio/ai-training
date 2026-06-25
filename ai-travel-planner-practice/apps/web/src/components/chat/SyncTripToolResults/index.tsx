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
  useCopilotMessagesContext,
  useRenderToolCall,
  type ActionRenderPropsNoArgs,
} from "@copilotkit/react-core";

import type {
  FlightsToolResult,
  HotelsToolResult,
  ToolDrivenCanvasPatch,
  CopilotMessage,
  TripBookingsToolResult,
  TripCanvasState,
  WeatherToolResult,
} from "@/types";
import {
  mapWeatherToolResult,
  isWeatherToolResult,
  getToolRenderPayload,
  parseToolResult,
  resolveToolSyncKind,
} from "@/utils";
import { INITIAL_TRIP_STATE } from "@/constants";

type SyncTripToolResultsProps = {
  setState: (
    update: (prev: TripCanvasState | undefined) => TripCanvasState,
  ) => void;
  setToolPatch: Dispatch<SetStateAction<ToolDrivenCanvasPatch>>;
};

type ToolRenderProps = ActionRenderPropsNoArgs & {
  name?: string;
  output?: unknown;
};

const SyncTripToolResultsComponent = ({
  setState,
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

      setToolPatch((prev: ToolDrivenCanvasPatch) => ({ ...prev, weather }));
      setState((prev: TripCanvasState | undefined) => ({
        ...(prev ?? INITIAL_TRIP_STATE),
        weather,
      }));

      return true;
    },
    [setState, setToolPatch],
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

      setToolPatch((prev: ToolDrivenCanvasPatch) => ({
        ...prev,
        activeTab: "book",
        ...(flights.length ? { flights } : {}),
        ...(hotels.length ? { hotels } : {}),
      }));

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

      setToolPatch((prev: ToolDrivenCanvasPatch) => ({
        ...prev,
        flights: parsed.flights,
        activeTab: "book",
      }));

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

      setToolPatch((prev: ToolDrivenCanvasPatch) => ({
        ...prev,
        hotels: parsed.hotels,
        activeTab: "book",
      }));

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

  const { messages } = useCopilotMessagesContext();

  useEffect(() => {
    if (!messages?.length) {
      return;
    }

    const typedMessages = messages as CopilotMessage[];

    for (const message of typedMessages) {
      const role = message.role?.toLowerCase();

      if (role !== "assistant" || !message.toolCalls?.length) {
        continue;
      }

      for (const toolCall of message.toolCalls) {
        const toolName = toolCall.function?.name ?? "";
        const toolMessage = typedMessages.find(
          (entry: CopilotMessage) =>
            entry.role?.toLowerCase() === "tool" &&
            entry.toolCallId === toolCall.id,
        );

        if (!toolName || !toolMessage?.content) {
          continue;
        }

        syncToolPayload(toolName, toolMessage.content);
      }
    }
  }, [messages, syncToolPayload]);

  return null;
};

export const SyncTripToolResults = memo(SyncTripToolResultsComponent);
