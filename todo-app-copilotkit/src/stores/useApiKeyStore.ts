import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ApiKeyStoreState {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  clearApiKey: () => void;
}

export const useApiKeyStore = create<ApiKeyStoreState>()(
  persist(
    (set) => ({
      apiKey: "",
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      clearApiKey: () => set({ apiKey: "" }),
    }),
    {
      name: "openai_api_key",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);
