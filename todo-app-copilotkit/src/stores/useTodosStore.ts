import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Todo, TodoItem, TodoStatus, UpdatedTodoItem } from "@/types";
import { parseIsoDate, todayIsoDate } from "@/utils";

const nextStatus = (s: TodoStatus): TodoStatus =>
  s === "todo" ? "in_progress" : s === "in_progress" ? "done" : "todo";

const recomputeNextTaskNumber = (todos: Todo[]): number => {
  if (todos.length === 0) return 1;
  const maxTask = todos.reduce((max, t) => Math.max(max, t.taskNumber), 0);
  return Math.max(maxTask + 1, 1);
};

const mergeSyncItems = (
  prev: Todo[],
  items: UpdatedTodoItem[],
  nextTaskNumber: { current: number }
): Todo[] => {
  const next = [...prev];

  for (const item of items) {
    const { id, ...fields } = item;
    const existingIndex = next.findIndex((todo) => todo.id === id);
    const startFromPayload = parseIsoDate(fields.startDate);
    const dueFromPayload = parseIsoDate(fields.dueDate);

    if (existingIndex !== -1) {
      const current = next[existingIndex];
      const updated: Todo = {
        ...current,
        text: fields.text?.trim() ? fields.text.trim() : current.text,
        status: fields.status ?? current.status,
        taskNumber: fields.taskNumber ?? current.taskNumber,
      };

      if (startFromPayload) updated.startDate = startFromPayload;
      if (dueFromPayload) updated.dueDate = dueFromPayload;

      next[existingIndex] = updated;
    } else {
      if (!fields.text?.trim()) continue;

      const taskNumber = fields.taskNumber ?? nextTaskNumber.current;
      nextTaskNumber.current = Math.max(nextTaskNumber.current, taskNumber + 1);
      const created: Todo = {
        id,
        text: fields.text.trim(),
        status: fields.status ?? "todo",
        taskNumber,
        startDate: startFromPayload ?? todayIsoDate(),
      };
      if (dueFromPayload) created.dueDate = dueFromPayload;
      next.push(created);
    }
  }

  return next;
};

const applyTodoFields = (todo: Todo, fields: Partial<TodoItem>): Todo => {
  const next: Todo = { ...todo };
  if (fields.text !== undefined) next.text = fields.text;
  if (fields.status !== undefined) next.status = fields.status;
  if (fields.taskNumber !== undefined) next.taskNumber = fields.taskNumber;

  if ("startDate" in fields) {
    const start = parseIsoDate(fields.startDate);
    if (start) next.startDate = start;
    else delete next.startDate;
  }

  if ("dueDate" in fields) {
    const due = parseIsoDate(fields.dueDate);
    if (due) next.dueDate = due;
    else delete next.dueDate;
  }

  return next;
};

interface TodosStoreState {
  todos: Todo[];
  nextTaskNumber: number;
  addTodo: (text: string) => boolean;
  updateTodo: (id: string, fields: Partial<TodoItem>) => void;
  syncTodos: (items: UpdatedTodoItem[], replaceAll?: boolean) => number;
  cycleStatus: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearTodos: () => void;
  clearCompletedTodos: () => void;
}

export const useTodosStore = create<TodosStoreState>()(
  persist(
    (set, get) => ({
      todos: [],
      nextTaskNumber: 1,

      addTodo: (text) => {
        const trimmed = text.trim();
        if (trimmed === "") return false;

        const taskNumber = get().nextTaskNumber;
        const todos = [
          ...get().todos,
          {
            id: crypto.randomUUID(),
            text: trimmed,
            status: "todo" as const,
            taskNumber,
            startDate: todayIsoDate(),
          },
        ];

        set({
          todos,
          nextTaskNumber: recomputeNextTaskNumber(todos),
        });
        return true;
      },

      updateTodo: (id, fields) => {
        set((state) => {
          const todos = state.todos.map((todo) =>
            todo.id === id ? applyTodoFields(todo, fields) : todo
          );
          return {
            todos,
            nextTaskNumber: recomputeNextTaskNumber(todos),
          };
        });
      },

      syncTodos: (items, replaceAll) => {
        const prev = get().todos;
        const base = replaceAll ? [] : prev;
        const prevIds = new Set(base.map((t) => t.id));
        const counter = { current: get().nextTaskNumber };
        const todos = mergeSyncItems(base, items, counter);

        set({
          todos,
          nextTaskNumber: recomputeNextTaskNumber(todos),
        });

        return todos.filter((t) => !prevIds.has(t.id)).length;
      },

      cycleStatus: (id) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, status: nextStatus(t.status) } : t
          ),
        }));
      },

      deleteTodo: (id) => {
        set((state) => {
          const todos = state.todos.filter((todo) => todo.id !== id);
          return {
            todos,
            nextTaskNumber: recomputeNextTaskNumber(todos),
          };
        });
      },

      clearTodos: () => set({ todos: [], nextTaskNumber: 1 }),

      clearCompletedTodos: () => {
        set((state) => {
          const todos = state.todos.filter((todo) => todo.status !== "done");
          return {
            todos,
            nextTaskNumber: recomputeNextTaskNumber(todos),
          };
        });
      },
    }),
    {
      name: "todos_storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        todos: state.todos,
        nextTaskNumber: state.nextTaskNumber,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.nextTaskNumber = recomputeNextTaskNumber(state.todos);
      },
    }
  )
);
