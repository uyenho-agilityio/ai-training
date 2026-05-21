import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Todo } from "@/types";

interface TodosStoreState {
  todos: Todo[];
  nextTaskNumber: number;
  setTodos: (updater: Todo[] | ((prev: Todo[]) => Todo[])) => void;
  setNextTaskNumber: (n: number) => void;
  resetTodos: () => void;
}

export const useTodosStore = create<TodosStoreState>()(
  persist(
    (set, get) => ({
      todos: [],
      nextTaskNumber: 1,
      setTodos: (updater) =>
        set({
          todos:
            typeof updater === "function" ? updater(get().todos) : updater,
        }),
      setNextTaskNumber: (nextTaskNumber) => set({ nextTaskNumber }),
      resetTodos: () => set({ todos: [], nextTaskNumber: 1 }),
    }),
    {
      name: "todos_storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        todos: state.todos,
        nextTaskNumber: state.nextTaskNumber,
      }),
    }
  )
);
