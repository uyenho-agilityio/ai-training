import type { ConversationSummary } from "@/types";

export const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "conv-tokyo-5d",
    title: "Tokyo · 5 days",
    preview: "Find flights and hotels near Shibuya for April.",
    updatedAt: Date.now() - 60 * 60 * 1000,
  },
  {
    id: "conv-paris-weekend",
    title: "Paris weekend",
    preview: "Romantic dinner spots and a Louvre day trip.",
    updatedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "conv-bali-family",
    title: "Bali family trip",
    preview: "Kid-friendly beaches and villa with pool.",
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

export const NEW_CONVERSATION_TITLE = "New trip";
export const NEW_CONVERSATION_PREVIEW = "No messages yet";
