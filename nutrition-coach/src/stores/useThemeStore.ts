import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Theme } from "@/utils/resolveTheme";

export const themeStorageKey = "nutrition-coach-theme";

type ThemeState = {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: null,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: themeStorageKey,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
