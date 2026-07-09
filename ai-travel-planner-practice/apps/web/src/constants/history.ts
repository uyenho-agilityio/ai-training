import { copilotAgent, copilotRuntimeUrl } from "./copilot";

const mastraServerOrigin = copilotRuntimeUrl.replace(/\/chat\/?$/, "");

export const mastraApiUrl = `${mastraServerOrigin}/api`;

export const MEMORY_AGENT_ID = copilotAgent;
export const MEMORY_RESOURCE_ID = copilotAgent;

export const DEFAULT_CONVERSATION_TITLE = "New trip";
export const NEW_CONVERSATION_PREVIEW = "No messages yet";

export const CONVERSATION_LIST_PAGE_SIZE = 50;
export const CONVERSATION_PREVIEW_FETCH_LIMIT = 20;

export const MEMORY_REQUEST_MAX_ATTEMPTS = 15;
export const MEMORY_REQUEST_RETRY_DELAY_MS = 500;

export const TRANSIENT_NETWORK_ERROR_PATTERN: RegExp =
  /failed to fetch|network|load failed|connection refused/i;

export const BOOT_AGENT_UNREACHABLE_MESSAGE: string =
  "Could not reach the travel agent server. Wait a few seconds and refresh, or ensure `pnpm dev` is running.";

export const BOOT_CONVERSATION_HISTORY_FAILED_MESSAGE: string =
  "Failed to load conversation history.";

export const MEMORY_REQUEST_RETRY_EXHAUSTED_MESSAGE: string =
  "Mastra memory request failed after retries.";
