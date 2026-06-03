"use client";

import type { ReactNode } from "react";

import { ChatThreadContext } from "../hooks/useChatThread";
import { useChatThreadState } from "../hooks/useChatThreadState";

type ChatThreadProviderProps = {
  children: ReactNode;
};

export const ChatThreadProvider = ({ children }: ChatThreadProviderProps) => {
  const value = useChatThreadState();

  return (
    <ChatThreadContext.Provider value={value}>
      {children}
    </ChatThreadContext.Provider>
  );
};
