import {
  MASTRA_AGENT_ID,
  MASTRA_API_BASE_URL,
  MASTRA_MEMORY_RESOURCE_ID,
} from "../constants";
import type {
  ListMessagesResponse,
  ListThreadsResponse,
  MemoryMessage,
  MemoryThread,
} from "../types/memory";

const memoryQuery = () =>
  new URLSearchParams({
    agentId: MASTRA_AGENT_ID,
    resourceId: MASTRA_MEMORY_RESOURCE_ID,
  });

const parseJson = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Mastra API error ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const listMemoryThreads = async (): Promise<MemoryThread[]> => {
  const params = memoryQuery();
  params.set("page", "0");
  params.set("perPage", "50");

  const res = await fetch(`${MASTRA_API_BASE_URL}/memory/threads?${params}`);
  const data = await parseJson<ListThreadsResponse>(res);
  return data.threads ?? [];
};

export const listThreadMessages = async (
  threadId: string,
): Promise<MemoryMessage[]> => {
  const params = memoryQuery();
  params.set("page", "0");
  params.set("perPage", "100");

  const res = await fetch(
    `${MASTRA_API_BASE_URL}/memory/threads/${threadId}/messages?${params}`,
  );
  const data = await parseJson<ListMessagesResponse>(res);
  return data.messages ?? [];
};

export const pickLatestThread = (
  threads: MemoryThread[],
): MemoryThread | null => {
  if (threads.length === 0) return null;
  return [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
};
