"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useApiKeyStore, useMessagesStore, useTodosStore } from "@/stores";

const StoresHydrationContext = createContext(false);

/** Load localStorage into Zustand once, then render the app (avoids empty state + F5 wipe). */
const rehydrateStores = () =>
  Promise.all([
    useApiKeyStore.persist.rehydrate(),
    useMessagesStore.persist.rehydrate(),
    useTodosStore.persist.rehydrate(),
  ]);

export const StoresHydrationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void rehydrateStores().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <main className="todos-page flex items-center justify-center">
        <span
          className="size-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </main>
    );
  }

  return (
    <StoresHydrationContext.Provider value={true}>
      {children}
    </StoresHydrationContext.Provider>
  );
};

export const useStoresHydrated = () => useContext(StoresHydrationContext);
