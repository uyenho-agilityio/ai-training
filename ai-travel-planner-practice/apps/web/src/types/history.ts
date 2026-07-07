export type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

export type ConversationHistoryContextValue = {
  conversations: ConversationSummary[];
  activeConversationId: string;
  activeConversation: ConversationSummary | undefined;
  isListOpen: boolean;
  openList: () => void;
  closeList: () => void;
  toggleList: () => void;
  selectConversation: (id: string) => void;
  createConversation: () => void;
  deleteConversation: (id: string) => void;
};
