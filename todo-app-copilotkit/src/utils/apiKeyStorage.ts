export const API_KEY_STORAGE_NAME = "openai_api_key";

export const readPersistedApiKey = (): string => {
  if (typeof window === "undefined") return "";

  try {
    const raw = localStorage.getItem(API_KEY_STORAGE_NAME);
    if (!raw) return "";

    const parsed = JSON.parse(raw) as { state?: { apiKey?: string } };
    return parsed.state?.apiKey?.trim() ?? "";
  } catch {
    return "";
  }
};
