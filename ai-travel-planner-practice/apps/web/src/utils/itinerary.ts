import { isGenerateConfirmChatIntent, isRetryChatMessage } from "./travel";

type TravelCanvasBridgeHandlers = {
  isGenerateItineraryReady: () => boolean;
  openGenerateItineraryConfirm: () => void;
  armGenerateConfirmFromAgent: () => void;
  isGenerateConfirmModalOpen: () => boolean;
  isGenerateConfirmPending: () => boolean;
  confirmGenerateItineraryModalFromChat: () => void;
  reopenGenerateItineraryConfirm: () => boolean;
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

  bridgeHandlers.openGenerateItineraryConfirm();

  return true;
};
