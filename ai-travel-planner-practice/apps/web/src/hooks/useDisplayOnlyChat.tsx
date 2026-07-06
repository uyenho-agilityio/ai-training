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
};

export const getDisplayInsertIndex = (
  agentMessages: ReadonlyArray<unknown>,
): number => agentMessages.length;

export const DisplayOnlyChatProvider = ({
  children,
}: DisplayOnlyChatProviderProps): ReactElement => {
  const [messages, setMessages] = useState<DisplayOnlyChatMessage[]>([]);

  const appendDisplayOnlyMessage = useCallback(
    (text: string, insertAfterMessageCount: number): void => {
      const trimmed: string = text.trim();

      if (!trimmed) {
        return;
      }

      setMessages(
        (previous: DisplayOnlyChatMessage[]): DisplayOnlyChatMessage[] => [
          ...previous,
          { id: crypto.randomUUID(), text: trimmed, insertAfterMessageCount },
        ],
      );
    },
    [],
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
