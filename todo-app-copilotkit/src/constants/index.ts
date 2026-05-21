export const INITIAL_TODOS = [
  {
    id: "task-1",
    taskNumber: 1,
    text: "Review project proposal",
    status: "done",
    startDate: "2026-05-01",
    dueDate: "2026-05-10",
  },
  {
    id: "task-2",
    taskNumber: 2,
    text: "Send follow-up email",
    status: "in_progress",
    startDate: "2026-05-18",
    dueDate: "2026-05-20",
  },
  {
    id: "task-3",
    taskNumber: 3,
    text: "Prepare presentation slides",
    status: "todo",
    startDate: "2026-05-20",
    dueDate: "2026-05-25",
  },
];

export const COPILOT_SIDEBAR_LABELS = {
  modalHeaderTitle: "Todo Assistant",
  welcomeMessageText: "Hi! I can help you manage your todo list.",
  chatInputPlaceholder: "Ask about your todos...",
  chatDisclaimerText:
    "AI can make mistakes. Please verify important information.",
};
