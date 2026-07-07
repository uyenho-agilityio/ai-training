import { copilotAgent, copilotRuntimeUrl } from "./copilot";

const mastraServerOrigin = copilotRuntimeUrl.replace(/\/chat\/?$/, "");

export const mastraApiUrl = `${mastraServerOrigin}/api`;

export const MEMORY_AGENT_ID = copilotAgent;
export const MEMORY_RESOURCE_ID = copilotAgent;

export const ACTIVE_THREAD_STORAGE_KEY = "travel-planner-active-thread-id";

export const DEFAULT_CONVERSATION_TITLE = "New trip";
export const NEW_CONVERSATION_PREVIEW = "No messages yet";

export const CONVERSATION_LIST_PAGE_SIZE = 50;
export const CONVERSATION_PREVIEW_FETCH_LIMIT = 20;
