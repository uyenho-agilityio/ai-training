import {
  isGenerateConfirmChatIntent,
  isGenerateItineraryChatIntent,
  isRetryChatMessage,
} from "./travel";

type TravelCanvasBridgeHandlers = {
  isGenerateItineraryReady: () => boolean;
  openGenerateItineraryConfirm: () => void;
  armGenerateConfirmFromAgent: () => void;
  isGenerateConfirmModalOpen: () => boolean;
  isGenerateConfirmPending: () => boolean;
  confirmGenerateItineraryModalFromChat: () => void;
  reopenGenerateItineraryConfirm: () => boolean;
  stopActiveAgentRun: () => void;
};

let bridgeHandlers: TravelCanvasBridgeHandlers | null = null;

/** Register canvas handlers so chat can open the generate-itinerary modal directly. */
export const registerTravelCanvasBridge = (
  handlers: TravelCanvasBridgeHandlers | null,
): void => {
  bridgeHandlers = handlers;
};

/** Allow the next agent selectBookings suggest-generate result to open the modal. */
export const armGenerateConfirmFromAgent = (): void => {
  bridgeHandlers?.armGenerateConfirmFromAgent();
};

/** True when the generate-itinerary confirmation modal is open on the canvas. */
export const isGenerateConfirmModalOpen = (): boolean =>
  bridgeHandlers?.isGenerateConfirmModalOpen() ?? false;

/** True after make-it-real opened the confirm flow until confirm or cancel. */
export const isGenerateConfirmPending = (): boolean =>
  bridgeHandlers?.isGenerateConfirmPending() ?? false;

/** Modal is open or a chat-initiated confirm flow is still pending. */
export const isAwaitingGenerateConfirmFromChat = (): boolean =>
  isGenerateConfirmModalOpen() || isGenerateConfirmPending();

/** Confirm the open generate-itinerary modal from a short chat affirmation (e.g. "go"). */
export const confirmGenerateItineraryModalFromChat = (): void => {
  bridgeHandlers?.confirmGenerateItineraryModalFromChat();
};

/** Re-open the generate-itinerary modal when the user affirms after cancel (e.g. "go"). */
export const tryReopenGenerateItineraryConfirm = (): boolean =>
  bridgeHandlers?.reopenGenerateItineraryConfirm() ?? false;

/** Reset canvas pending UI immediately after the user stops an agent run. */
export const stopActiveAgentRun = (): void => {
  bridgeHandlers?.stopActiveAgentRun();
};

/**
 * Handle short chat confirmations ("go", "yes") for the generate-itinerary modal.
 * Returns true when the message was consumed (confirm, reopen, or pending confirm).
 */
export const tryHandleGenerateConfirmChatIntent = (
  message: string,
): boolean => {
  if (!bridgeHandlers || !isGenerateConfirmChatIntent(message)) {
    return false;
  }

  if (isAwaitingGenerateConfirmFromChat()) {
    bridgeHandlers.confirmGenerateItineraryModalFromChat();
    return true;
  }

  return bridgeHandlers.reopenGenerateItineraryConfirm();
};

/**
 * When canvas is ready, retry full-itinerary via the confirmation modal
 * instead of calling selectBookingsTool on the agent.
 */
export const tryHandleGenerateRetryChatIntent = (message: string): boolean => {
  if (!bridgeHandlers || !isRetryChatMessage(message)) {
    return false;
  }

  if (!bridgeHandlers.isGenerateItineraryReady()) {
    return false;
  }

  return bridgeHandlers.reopenGenerateItineraryConfirm();
};

/**
 * When chat asks to make/generate a full itinerary and the canvas is ready,
 * open the confirmation modal instead of relying on the agent to call selectBookingsTool.
 */
export const tryHandleGenerateItineraryChatIntent = (
  message: string,
  isIntent: (text: string) => boolean,
): boolean => {
  if (!bridgeHandlers || !isIntent(message)) {
    return false;
  }

  if (!bridgeHandlers.isGenerateItineraryReady()) {
    return false;
  }

  if (bridgeHandlers.isGenerateConfirmModalOpen()) {
    return true;
  }

  if (bridgeHandlers.isGenerateConfirmPending()) {
    return bridgeHandlers.reopenGenerateItineraryConfirm();
  }

  bridgeHandlers.openGenerateItineraryConfirm();

  return true;
};

/** True when the canvas can open the generate-itinerary confirmation modal. */
export const isGenerateItineraryReadyOnCanvas = (): boolean =>
  bridgeHandlers?.isGenerateItineraryReady() ?? false;

/** Opens the generate-itinerary modal from chat when the canvas is ready. */
export const openGenerateItineraryConfirmFromChat = (): void => {
  bridgeHandlers?.openGenerateItineraryConfirm();
};

/**
 * Consumes make-it-real / regenerate chat intents on the client.
 * When the canvas is ready, never forwards to the agent (avoids "confirm on canvas" loops).
 */
export const tryConsumeGenerateItineraryFromChat = (
  message: string,
): boolean => {
  const isMakeItReal: boolean = isGenerateItineraryChatIntent(message);
  const isRetry: boolean = isRetryChatMessage(message);

  if (!isMakeItReal && !isRetry) {
    return false;
  }

  if (
    isMakeItReal &&
    tryHandleGenerateItineraryChatIntent(message, isGenerateItineraryChatIntent)
  ) {
    return true;
  }

  if (isRetry && tryHandleGenerateRetryChatIntent(message)) {
    return true;
  }

  if (isGenerateItineraryReadyOnCanvas()) {
    openGenerateItineraryConfirmFromChat();
    return true;
  }

  armGenerateConfirmFromAgent();

  return false;
};
