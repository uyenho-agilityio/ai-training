export type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  /** True only for conversations created via the + New button. */
  isNewTrip?: boolean;
};

export type MastraMemoryThread = {
  id: string;
  title?: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type MastraThreadListResponse = {
  threads: MastraMemoryThread[];
  total: number;
  page: number;
  perPage: number | false;
  hasMore: boolean;
};

export type MastraThreadMessage = {
  id?: string;
  role?: string;
  content?: string | Array<{ type?: string; text?: string }>;
  createdAt?: string;
};

export type MastraThreadMessagesResponse = {
  messages: MastraThreadMessage[];
};

export type ConversationHistoryContextValue = {
  conversations: ConversationSummary[];
  activeConversationId: string;
  activeConversation: ConversationSummary | undefined;
  isListOpen: boolean;
  isLoading: boolean;
  isSwitching: boolean;
  deletingConversationId: string | null;
  error: string | null;
  openList: () => void;
  closeList: () => void;
  toggleList: () => void;
  selectConversation: (id: string) => void;
  createConversation: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  setConversationLocationTitle: (id: string, location: string) => void;
};
