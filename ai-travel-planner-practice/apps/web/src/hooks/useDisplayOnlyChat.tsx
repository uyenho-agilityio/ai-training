"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type DisplayOnlyChatMessage = {
  id: string;
  text: string;
  insertAfterMessageCount: number;
};

type DisplayOnlyChatContextValue = {
  messages: DisplayOnlyChatMessage[];
  appendDisplayOnlyMessage: (
    text: string,
    insertAfterMessageCount: number,
  ) => void;
};

const DisplayOnlyChatContext =
  createContext<DisplayOnlyChatContextValue | null>(null);

type DisplayOnlyChatProviderProps = {
  children: ReactNode;
  threadId: string;
};

type DisplayOnlyChatStore = Record<string, DisplayOnlyChatMessage[]>;

const EMPTY_DISPLAY_MESSAGES: DisplayOnlyChatMessage[] = [];

export const getDisplayInsertIndex = (
  agentMessages: ReadonlyArray<unknown>,
): number => agentMessages.length;

/** Canvas-only user bubbles stored per Mastra thread (not in agent memory). */
export const DisplayOnlyChatProvider = ({
  children,
  threadId,
}: DisplayOnlyChatProviderProps): ReactElement => {
  const [store, setStore] = useState<DisplayOnlyChatStore>({});

  const messages = store[threadId] ?? EMPTY_DISPLAY_MESSAGES;

  const appendDisplayOnlyMessage = useCallback(
    (text: string, insertAfterMessageCount: number): void => {
      const trimmed: string = text.trim();

      if (!trimmed) {
        return;
      }

      setStore((current: DisplayOnlyChatStore): DisplayOnlyChatStore => {
        const threadMessages = current[threadId] ?? [];

        return {
          ...current,
          [threadId]: [
            ...threadMessages,
            {
              id: crypto.randomUUID(),
              text: trimmed,
              insertAfterMessageCount,
            },
          ],
        };
      });
    },
    [threadId],
  );

  const value = useMemo(
    (): DisplayOnlyChatContextValue => ({
      messages,
      appendDisplayOnlyMessage,
    }),
    [appendDisplayOnlyMessage, messages],
  );

  return (
    <DisplayOnlyChatContext.Provider value={value}>
      {children}
    </DisplayOnlyChatContext.Provider>
  );
};

export const useDisplayOnlyChat = (): DisplayOnlyChatContextValue => {
  const context = useContext(DisplayOnlyChatContext);

  if (!context) {
    throw new Error(
      "useDisplayOnlyChat must be used within DisplayOnlyChatProvider",
    );
  }

  return context;
};
