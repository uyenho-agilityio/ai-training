import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ThemeChoice } from "@/utils/resolveTheme";

export const themeStorageKey = "nutrition-coach-theme";

type ThemeState = {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: themeStorageKey,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
