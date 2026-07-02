export type ToolConfirmationActionType =
  | "weather"
  | "hotels"
  | "flights"
  | "trip-bookings";

export type ToolConfirmationArgs = {
  actionType: ToolConfirmationActionType | string;
  message: string;
  summary?: string;
};

export type ToolConfirmationResult = {
  approved: boolean;
};

export type ToolConfirmationRenderStatus =
  | "inProgress"
  | "executing"
  | "complete";

export type TextMessagePart = {
  type: "text";
  text: string;
};

export type AssistantMessageContent = string | TextMessagePart[];
