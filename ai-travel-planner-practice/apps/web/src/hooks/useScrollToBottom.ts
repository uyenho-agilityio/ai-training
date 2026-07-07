import { useCallback, useEffect, useRef, type RefObject } from "react";

export type ScrollToBottomMessage = {
  role?: string;
};

type UseScrollToBottomOptions = {
  inProgress?: boolean;
};

type UseScrollToBottomResult = {
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export const useScrollToBottom = (
  messages: readonly ScrollToBottomMessage[],
  options: UseScrollToBottomOptions = {},
): UseScrollToBottomResult => {
  const { inProgress = false } = options;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isUserScrollUpRef = useRef(false);

  const scrollToBottom = useCallback((): void => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      const scrollContainer = messagesContainerRef.current;
      if (!scrollContainer) {
        return;
      }

      isProgrammaticScrollRef.current = true;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });
  }, []);

  const handleScroll = useCallback((): void => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    isUserScrollUpRef.current = scrollTop + clientHeight < scrollHeight - 8;
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const mutationObserver = new MutationObserver(() => {
      if (!isUserScrollUpRef.current) {
        scrollToBottom();
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    isUserScrollUpRef.current = false;
    scrollToBottom();
  }, [
    messages.filter((message) => message.role === "user").length,
    scrollToBottom,
  ]);

  useEffect(() => {
    isUserScrollUpRef.current = false;
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (inProgress) {
      scrollToBottom();
    }
  }, [inProgress, scrollToBottom]);

  return { messagesEndRef, messagesContainerRef };
};
