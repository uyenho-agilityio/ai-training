type ToolPayloadRecord = Record<string, unknown>;

const WRAPPER_KEYS: readonly (keyof ToolPayloadRecord)[] = [
  "result",
  "output",
  "data",
];

/** True when payload looks like a synced travel tool result. */
const isToolPayload = (value: unknown): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as ToolPayloadRecord;

  return (
    Array.isArray(record.hotels) ||
    Array.isArray(record.flights) ||
    typeof record.temperature === "number" ||
    (typeof record.location === "string" &&
      typeof record.checkIn === "string") ||
    (typeof record.origin === "string" &&
      typeof record.destination === "string" &&
      !Array.isArray(record.places) &&
      record.sketch === undefined &&
      record.itinerary === undefined) ||
    (typeof record.destination === "string" &&
      Array.isArray(record.places) &&
      record.places.length > 0) ||
    (typeof record.destination === "string" &&
      record.sketch !== undefined &&
      typeof record.sketch === "object") ||
    (record.itinerary !== undefined && typeof record.itinerary === "object") ||
    record.selectedFlightId !== undefined ||
    record.selectedHotelId !== undefined
  );
};

/**
 * Unwrap nested CopilotKit / Mastra tool payloads until a tool result object is found.
 * Handles JSON strings, content arrays, and wrapper keys (result, output, data).
 */
export const unwrapToolResult = (payload: unknown): unknown => {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === "string") {
    try {
      return unwrapToolResult(JSON.parse(payload));
    } catch {
      return null;
    }
  }

  if (Array.isArray(payload)) {
    for (const part of payload) {
      const unwrapped = unwrapToolResult(part);

      if (isToolPayload(unwrapped)) {
        return unwrapped;
      }
    }

    return null;
  }

  if (typeof payload !== "object") {
    return payload;
  }

  const record = payload as ToolPayloadRecord;

  if (isToolPayload(record)) {
    return record;
  }

  if (typeof record.text === "string") {
    const fromText = unwrapToolResult(record.text);

    if (fromText !== null && fromText !== undefined) {
      return fromText;
    }
  }

  if (record.json !== undefined) {
    return unwrapToolResult(record.json);
  }

  for (const key of WRAPPER_KEYS) {
    if (record[key] !== undefined) {
      return unwrapToolResult(record[key]);
    }
  }

  return record;
};

/** Parse a tool result into a typed object. */
export const parseToolResult = <T>(result: unknown): T | null => {
  const unwrapped = unwrapToolResult(result);

  if (unwrapped == null) {
    return null;
  }

  return unwrapped as T;
};

/** Normalize CopilotKit / Mastra tool names for loose matching. */
const normalizeToolName = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/_/g, "-");

/** True when tool name includes any of the given patterns. */
export const matchesToolName = (
  name: string,
  patterns: readonly string[],
): boolean => {
  const normalized: string = normalizeToolName(name);

  return patterns.some((pattern: string) => normalized.includes(pattern));
};
