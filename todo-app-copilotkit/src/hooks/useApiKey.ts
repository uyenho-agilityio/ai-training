"use client";

import { useCallback, useMemo } from "react";

import { useApiKeyStore } from "@/stores";

import { useStoresHydrated } from "@/components/StoresHydrationProvider";

export const useApiKey = () => {
  const isHydrated = useStoresHydrated();
  const apiKey = useApiKeyStore((s) => s.apiKey);
  const setApiKey = useApiKeyStore((s) => s.setApiKey);
  const clearApiKey = useApiKeyStore((s) => s.clearApiKey);

  const hasApiKey = useMemo(
    () => isHydrated && Boolean(apiKey.trim()),
    [apiKey, isHydrated]
  );

  const getCopilotHeaders = useCallback((): Record<string, string> => {
    const trimmed = apiKey.trim();
    return trimmed ? { ["x-openai-api-key"]: trimmed } : {};
  }, [apiKey]);

  const handleSaveKey = useCallback(
    (value: string) => {
      setApiKey(value);
    },
    [setApiKey]
  );

  const maskApiKey = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed.length <= 8) return "••••••••";
    return `${trimmed.slice(0, 3)}…${trimmed.slice(-4)}`;
  }, []);

  return {
    apiKey,
    hasApiKey,
    isHydrated,
    clearApiKey,
    getCopilotHeaders,
    maskApiKey,
    handleSaveKey,
  };
};
