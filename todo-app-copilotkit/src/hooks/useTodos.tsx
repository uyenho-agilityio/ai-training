"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";

import { TodoToolStatus } from "@/components/TodoToolStatus";
import { clearTodosSchema, deleteTodoSchema, todosSchema } from "@/schemas";
import type {
  Todo,
  TodoItem,
  TodoToolRenderProps,
  UpdatedTodoItem,
} from "@/types";

export const useTodos = (options?: { onNewTasksFromSync?: () => void }) => {
  const onNewSyncRef = useRef(options?.onNewTasksFromSync);

  useEffect(() => {
    onNewSyncRef.current = options?.onNewTasksFromSync;
  }, [options?.onNewTasksFromSync]);

  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const nextTaskNumber = useRef(1);

  const handleAddTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed === "") return;

    const taskNumber = nextTaskNumber.current;
    nextTaskNumber.current += 1;

    setTodos((prev) => [
      ...prev,
      {
        id: nanoid(),
        text: trimmed,
        isCompleted: false,
        taskNumber,
      },
    ]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleAddTodo(input);
      setInput("");
    },
    [input, handleAddTodo]
  );

  const handleUpdateTodo = useCallback(
    (id: string, fields: Partial<TodoItem>) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...fields } : todo))
      );
    },
    []
  );

  const applySyncItems = useCallback((items: UpdatedTodoItem[]) => {
    setTodos((prev) => {
      const next = [...prev];

      for (const item of items) {
        const { id, ...fields } = item;
        const existingIndex = next.findIndex((todo) => todo.id === id);

        if (existingIndex !== -1) {
          next[existingIndex] = {
            ...next[existingIndex],
            ...fields,
            taskNumber: fields.taskNumber ?? next[existingIndex].taskNumber,
          };
        } else {
          if (!fields.text?.trim()) continue;

          const taskNumber = fields.taskNumber ?? nextTaskNumber.current;
          nextTaskNumber.current = Math.max(
            nextTaskNumber.current,
            taskNumber + 1
          );
          next.push({
            id,
            text: fields.text,
            isCompleted: fields.isCompleted ?? false,
            taskNumber,
          });
        }
      }

      return next;
    });
  }, []);

  const handleUpdateTodos = useCallback(
    (items: UpdatedTodoItem[]) => {
      const existingIds = new Set(todos.map((t) => t.id));
      const addsNewTask = items.some((item) => !existingIds.has(item.id));
      applySyncItems(items);
      if (addsNewTask) onNewSyncRef.current?.();
    },
    [todos, applySyncItems]
  );

  const handleToggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const handleClearTodos = useCallback(() => {
    setTodos([]);
    nextTaskNumber.current = 1;
  }, []);

  const handleClearCompletedTodos = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.isCompleted));
  }, []);

  useAgentContext({
    description:
      "The user's todo list. Use clearTodos to remove every item, clearCompletedTodos for completed items only, deleteTodo for one item, and syncTodos to add or update.",
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "syncTodos",
    description:
      "Add or update todos. Cannot delete items — use deleteTodo, clearCompletedTodos, or clearTodos instead.",
    parameters: todosSchema,
    handler: async ({ items }) => {
      handleUpdateTodos(items);
      return `Synced ${items.length} todo(s).`;
    },
    render: (props) => (
      <TodoToolStatus
        {...(props as TodoToolRenderProps)}
        labels={{
          inProgress: "Preparing todo changes…",
          executing: "Applying todo changes…",
        }}
      />
    ),
  });

  useFrontendTool({
    name: "deleteTodo",
    description: "Delete a single todo by id",
    parameters: deleteTodoSchema,
    handler: async ({ id }) => {
      handleDeleteTodo(id);
      return `Deleted todo.`;
    },
    render: (props) => (
      <TodoToolStatus
        {...(props as TodoToolRenderProps)}
        labels={{
          inProgress: "Preparing to delete…",
          executing: "Deleting todo…",
        }}
      />
    ),
  });

  useFrontendTool(
    {
      name: "clearTodos",
      description:
        "Remove every todo from the list. Use when the user wants to clear all, reset, or start a fresh list.",
      parameters: clearTodosSchema,
      handler: async () => {
        const count = todos.length;
        handleClearTodos();
        return count > 0
          ? `Cleared all ${count} todo(s). The list is now empty.`
          : "The todo list is already empty.";
      },
      render: (props) => (
        <TodoToolStatus
          {...(props as TodoToolRenderProps)}
          labels={{
            inProgress: "Preparing to clear list…",
            executing: "Clearing all todos…",
          }}
        />
      ),
    },
    [todos]
  );

  useFrontendTool(
    {
      name: "clearCompletedTodos",
      description: "Remove all completed todos from the list",
      parameters: clearTodosSchema,
      handler: async () => {
        const completedCount = todos.filter((todo) => todo.isCompleted).length;
        handleClearCompletedTodos();
        return completedCount > 0
          ? `Removed ${completedCount} completed todo(s).`
          : "No completed todos to remove.";
      },
      render: (props) => (
        <TodoToolStatus
          {...(props as TodoToolRenderProps)}
          labels={{
            inProgress: "Preparing to clean up…",
            executing: "Removing completed todos…",
          }}
        />
      ),
    },
    [todos]
  );

  return {
    todos,
    input,
    hasInput: input.trim().length > 0,
    setInput,
    handleSubmit,
    handleAddTodo,
    handleUpdateTodo,
    handleUpdateTodos,
    handleToggleTodo,
    handleDeleteTodo,
    handleClearTodos,
    handleClearCompletedTodos,
  };
};
