const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

export const getSerpApiKey = (): string => {
  const apiKey = process.env.SERPAPI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not configured");
  }

  return apiKey;
};

/** True when SerpAPI can be called (key present in env). */
export const hasSerpApiKey = (): boolean =>
  Boolean(process.env.SERPAPI_API_KEY?.trim());

type SerpApiParams = Record<string, string | number>;

type SerpApiErrorPayload = {
  error?: string;
};

export const fetchSerpApi = async <T>(params: SerpApiParams): Promise<T> => {
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("api_key", getSerpApiKey());

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString());

  if (process.env.NODE_ENV !== "production") {
    const safeParams = Object.fromEntries(
      [...url.searchParams.entries()].filter(([key]) => key !== "api_key"),
    );
    console.info("[SerpAPI] request", safeParams);
  }

  if (!response.ok) {
    throw new Error(`SerpAPI request failed (${response.status})`);
  }

  const data = (await response.json()) as T & SerpApiErrorPayload;

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const formatSerpApiPrice = (
  amount: number,
  currency: string,
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

/** Extract HH:MM from SerpAPI airport datetime strings. */
export const formatSerpApiTime = (dateTime: string): string => {
  const timePart = dateTime.split(" ").pop();

  return timePart ?? dateTime;
};
