import {
  CONVERSATION_LIST_PAGE_SIZE,
  CONVERSATION_PREVIEW_FETCH_LIMIT,
  DEFAULT_CONVERSATION_TITLE,
  MEMORY_AGENT_ID,
  MEMORY_REQUEST_MAX_ATTEMPTS,
  MEMORY_REQUEST_RETRY_DELAY_MS,
  BOOT_AGENT_UNREACHABLE_MESSAGE,
  BOOT_CONVERSATION_HISTORY_FAILED_MESSAGE,
  MEMORY_REQUEST_RETRY_EXHAUSTED_MESSAGE,
  MEMORY_RESOURCE_ID,
  NEW_CONVERSATION_PREVIEW,
  TRANSIENT_HTTP_STATUS_CODES,
  TRANSIENT_NETWORK_ERROR_PATTERN,
  mastraApiUrl,
} from "@/constants";
import type {
  ConversationSummary,
  MastraMemoryThread,
  MastraThreadListResponse,
  MastraThreadMessage,
  MastraThreadMessagesResponse,
} from "@/types";
import type { TripCanvasState } from "@/types";
import { unwrapToolResult } from "@/utils";

type MemoryQueryParams = Record<string, string>;

const buildMemoryQuery = (params: MemoryQueryParams): string => {
  const searchParams = new URLSearchParams(params);
  return searchParams.toString();
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** True for connection errors while the Mastra dev server is still starting. */
const isTransientMemoryFetchError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    return TRANSIENT_NETWORK_ERROR_PATTERN.test(error.message);
  }

  return false;
};

const isTransientMemoryStatus = (status: number): boolean =>
  TRANSIENT_HTTP_STATUS_CODES.includes(status);

const executeMemoryRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${mastraApiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!response.ok) {
    const error = new Error(
      body.trim() || `Mastra memory request failed (${response.status})`,
    );

    if (isTransientMemoryStatus(response.status)) {
      (error as Error & { transient?: boolean }).transient = true;
    }

    throw error;
  }

  if (response.status === 204 || body.length === 0) {
    return undefined as T;
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Mastra memory API returned non-JSON (${contentType}). Check NEXT_PUBLIC_COPILOT_RUNTIME_URL (memory base: ${mastraApiUrl}).`,
    );
  }

  return JSON.parse(body) as T;
};

const memoryRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < MEMORY_REQUEST_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await executeMemoryRequest<T>(path, init);
    } catch (error) {
      lastError = error;

      const isTransientStatusError =
        error instanceof Error &&
        (error as Error & { transient?: boolean }).transient === true;

      const shouldRetry =
        isTransientMemoryFetchError(error) || isTransientStatusError;

      const isLastAttempt = attempt === MEMORY_REQUEST_MAX_ATTEMPTS - 1;

      if (!shouldRetry || isLastAttempt) {
        throw error;
      }

      await delay(MEMORY_REQUEST_RETRY_DELAY_MS);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(MEMORY_REQUEST_RETRY_EXHAUSTED_MESSAGE);
};

export const resolveBootErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return BOOT_CONVERSATION_HISTORY_FAILED_MESSAGE;
  }

  if (TRANSIENT_NETWORK_ERROR_PATTERN.test(error.message)) {
    return BOOT_AGENT_UNREACHABLE_MESSAGE;
  }

  return error.message;
};

type MastraMessageTextPart = { type?: string; text?: string };

/** Extract plain text from Mastra memory message content (string, array, or { parts }). */
const extractMessageText = (message: MastraThreadMessage): string => {
  const content: unknown = message.content;

  if (typeof content === "string") {
    return content.trim();
  }

  const parts: MastraMessageTextPart[] | undefined = Array.isArray(content)
    ? content
    : content && typeof content === "object" && "parts" in content
      ? (content as { parts?: MastraMessageTextPart[] }).parts
      : undefined;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
};

const toTimestamp = (value: string | undefined): number => {
  if (!value) {
    return Date.now();
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

/** Compact relative time for conversation list rows. */
export const formatConversationUpdatedAt = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return "Just now";
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `${minutes}m ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours}h ago`;
  }

  const days = Math.floor(diffMs / dayMs);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
};

/** Fetch persisted messages for a Mastra memory thread (newest page first). */
export const fetchMemoryThreadMessages = async (
  threadId: string,
): Promise<MastraThreadMessage[]> => {
  const query = buildMemoryQuery({
    agentId: MEMORY_AGENT_ID,
    resourceId: MEMORY_RESOURCE_ID,
    perPage: "20",
    page: "0",
    "orderBy[field]": "createdAt",
    "orderBy[direction]": "DESC",
  });

  const response = await memoryRequest<MastraThreadMessagesResponse>(
    `/memory/threads/${encodeURIComponent(threadId)}/messages?${query}`,
  );

  return response.messages ?? [];
};

/** Fetch a single Mastra memory thread (includes metadata). */
export const fetchMemoryThread = async (
  threadId: string,
): Promise<MastraMemoryThread> => {
  const query = buildMemoryQuery({
    agentId: MEMORY_AGENT_ID,
    resourceId: MEMORY_RESOURCE_ID,
    threadId,
  });

  const response = await memoryRequest<MastraThreadListResponse>(
    `/memory/threads?${query}`,
  );

  const thread: MastraMemoryThread | undefined = response.threads?.[0];

  if (!thread) {
    throw new Error("Mastra thread not found.");
  }

  return thread;
};

/** Parse co-agent working memory persisted on a Mastra thread. */
export const parseWorkingMemoryFromMetadata = (
  metadata: MastraMemoryThread["metadata"],
): TripCanvasState | null => {
  const raw = metadata?.workingMemory;

  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as TripCanvasState;
  } catch {
    return null;
  }
};

/** Persist co-agent working memory onto a Mastra thread's metadata. */
export const updateMemoryThreadWorkingMemory = async (
  threadId: string,
  workingMemory: TripCanvasState,
): Promise<void> => {
  const query = buildMemoryQuery({ agentId: MEMORY_AGENT_ID });

  await memoryRequest<MastraMemoryThread>(
    `/memory/threads/${encodeURIComponent(threadId)}?${query}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        metadata: { workingMemory: JSON.stringify(workingMemory) },
      }),
    },
  );
};

/** Extract a destination label from a travel tool payload. */
export const extractDestinationLabel = (value: unknown): string | null => {
  const unwrapped = unwrapToolResult(value);

  if (!unwrapped || typeof unwrapped !== "object" || Array.isArray(unwrapped)) {
    return null;
  }

  const record = unwrapped as Record<string, unknown>;
  const destination =
    typeof record.destination === "string" ? record.destination.trim() : "";
  const location =
    typeof record.location === "string" ? record.location.trim() : "";

  return destination || location || null;
};

/** Strip an existing " trip" suffix and optional country from a location label. */
export const normalizeLocationLabel = (rawLocation: string): string => {
  let label = rawLocation.trim();

  if (!label) {
    return label;
  }

  if (label.toLowerCase().endsWith(" trip")) {
    label = label.slice(0, -5).trim();
  }

  const commaIndex = label.indexOf(",");

  if (commaIndex > 0) {
    return label.slice(0, commaIndex).trim();
  }

  return label;
};

/** Format a location as a conversation title, e.g. "Nha Trang trip". */
export const formatLocationTripTitle = (rawLocation: string): string => {
  const normalized = normalizeLocationLabel(rawLocation);

  if (!normalized) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  return `${normalized} trip`;
};

/** Scan thread messages for the latest destination mentioned by a tool result. */
export const extractDestinationFromMessages = (
  messages: MastraThreadMessage[],
): string | null => {
  for (const message of [...messages].reverse()) {
    const fromContent = extractDestinationLabel(message.content);

    if (fromContent) {
      return fromContent;
    }

    const text = extractMessageText(message);

    if (text) {
      const fromText = extractDestinationLabel(text);

      if (fromText) {
        return fromText;
      }
    }
  }

  return null;
};

/** Resolve a human-readable location title from memory and optional messages. */
export const resolveConversationLocationTitle = (
  workingMemory: TripCanvasState | null,
  messages?: MastraThreadMessage[],
): string | null => {
  if (messages?.length) {
    const fromMessages = extractDestinationFromMessages(messages);

    if (fromMessages) {
      return fromMessages;
    }
  }

  const weatherLocation = workingMemory?.weather?.location?.trim();

  if (weatherLocation) {
    return weatherLocation;
  }

  return null;
};

const resolveConversationTitle = (
  thread: MastraMemoryThread,
  workingMemory: TripCanvasState | null,
  messages?: MastraThreadMessage[],
): string => {
  const locationTitle = resolveConversationLocationTitle(
    workingMemory,
    messages,
  );

  if (locationTitle) {
    return formatLocationTripTitle(locationTitle);
  }

  const storedTitle = thread.title?.trim();

  if (storedTitle && storedTitle !== DEFAULT_CONVERSATION_TITLE) {
    return formatLocationTripTitle(storedTitle);
  }

  return DEFAULT_CONVERSATION_TITLE;
};

const mapThreadToSummary = async (
  thread: MastraMemoryThread,
  fetchPreview: boolean,
): Promise<ConversationSummary> => {
  const workingMemory = parseWorkingMemoryFromMetadata(thread.metadata);
  let preview = NEW_CONVERSATION_PREVIEW;
  let messages: MastraThreadMessage[] | undefined;

  if (fetchPreview) {
    try {
      messages = await fetchMemoryThreadMessages(thread.id);
      const previewMessage = [...messages].reverse().find((message) => {
        const role = message.role?.toLowerCase() ?? "";
        return (
          (role === "user" || role === "assistant") &&
          extractMessageText(message).length > 0
        );
      });

      preview = previewMessage
        ? extractMessageText(previewMessage)
        : NEW_CONVERSATION_PREVIEW;
    } catch {
      preview = resolveConversationTitle(thread, workingMemory);
    }
  }

  const title = resolveConversationTitle(thread, workingMemory, messages);

  return {
    id: thread.id,
    title,
    preview: preview || NEW_CONVERSATION_PREVIEW,
    updatedAt: toTimestamp(thread.updatedAt),
    isNewTrip: false,
  };
};

const fetchMemoryThreadPage = async (
  page: number,
): Promise<MastraThreadListResponse> => {
  const query = buildMemoryQuery({
    agentId: MEMORY_AGENT_ID,
    resourceId: MEMORY_RESOURCE_ID,
    perPage: String(CONVERSATION_LIST_PAGE_SIZE),
    page: String(page),
    "orderBy[field]": "updatedAt",
    "orderBy[direction]": "DESC",
  });

  return memoryRequest<MastraThreadListResponse>(`/memory/threads?${query}`);
};

/** Load all Mastra memory thread pages for the travel agent resource. */
export const fetchConversationSummaries = async (): Promise<
  ConversationSummary[]
> => {
  const threads: MastraMemoryThread[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchMemoryThreadPage(page);
    threads.push(...(response.threads ?? []));
    hasMore = response.hasMore === true;
    page += 1;
  }

  return Promise.all(
    threads.map((thread, index) =>
      mapThreadToSummary(thread, index < CONVERSATION_PREVIEW_FETCH_LIMIT),
    ),
  );
};

/** Create a new Mastra memory thread for the current resource. */
export const createMemoryThread = async (
  threadId: string,
  title: string = DEFAULT_CONVERSATION_TITLE,
): Promise<MastraMemoryThread> => {
  const query = buildMemoryQuery({ agentId: MEMORY_AGENT_ID });

  return memoryRequest<MastraMemoryThread>(`/memory/threads?${query}`, {
    method: "POST",
    body: JSON.stringify({
      threadId,
      title,
      resourceId: MEMORY_RESOURCE_ID,
    }),
  });
};

type OfflineBootState = {
  threadId: string;
  conversations: ConversationSummary[];
};

/** Local-only boot when Mastra memory API is unreachable (chat still works). */
export const createOfflineBootState = (): OfflineBootState => {
  const threadId = crypto.randomUUID();

  return {
    threadId,
    conversations: [
      {
        id: threadId,
        title: DEFAULT_CONVERSATION_TITLE,
        preview: NEW_CONVERSATION_PREVIEW,
        updatedAt: Date.now(),
        isNewTrip: true,
      },
    ],
  };
};

/** Persist a location-based title on a Mastra memory thread. */
export const updateMemoryThreadTitle = async (
  threadId: string,
  title: string,
): Promise<void> => {
  const query = buildMemoryQuery({ agentId: MEMORY_AGENT_ID });

  await memoryRequest<MastraMemoryThread>(
    `/memory/threads/${encodeURIComponent(threadId)}?${query}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
  );
};

/** Delete a Mastra memory thread. Treats 404 as success (already removed). */
export const deleteMemoryThread = async (threadId: string): Promise<void> => {
  const query = buildMemoryQuery({
    agentId: MEMORY_AGENT_ID,
    resourceId: MEMORY_RESOURCE_ID,
  });

  const response = await fetch(
    `${mastraApiUrl}/memory/threads/${encodeURIComponent(threadId)}?${query}`,
    { method: "DELETE" },
  );

  if (response.status === 404) {
    return;
  }

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      body.trim() || `Mastra memory request failed (${response.status})`,
    );
  }
};
