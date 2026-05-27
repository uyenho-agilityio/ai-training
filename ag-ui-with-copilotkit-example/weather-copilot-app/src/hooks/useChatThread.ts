"use client";

import { createContext, useContext } from "react";

import { ChatThreadContextValue } from "../types";

export const ChatThreadContext = createContext<ChatThreadContextValue | null>(
  null
);

export const useChatThread = () => {
  const ctx = useContext(ChatThreadContext);
  if (!ctx) {
    throw new Error("useChatThread must be used within ChatThreadProvider");
  }
  return ctx;
};
