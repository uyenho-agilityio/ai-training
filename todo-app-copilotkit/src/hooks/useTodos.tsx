"use client";

import {
  useAgentContext,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";

import { TodoToolStatus, DeleteConfirmation } from "@/components";
import { clearTodosSchema, deleteTodoSchema, todosSchema } from "@/schemas";
import type {
  Todo,
  TodoItem,
  TodoStatus,
  TodoToolRenderProps,
  UpdatedTodoItem,
} from "@/types";

const nextStatus: (s: TodoStatus) => TodoStatus = (s) =>
  s === "todo" ? "in_progress" : s === "in_progress" ? "done" : "todo";

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
        status: "todo",
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
            status: fields.status ?? next[existingIndex].status,
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
            status: fields.status ?? "todo",
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

  const handleCycleStatus = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: nextStatus(t.status) } : t
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
    setTodos((prev) => prev.filter((todo) => todo.status !== "done"));
  }, []);

  useAgentContext({
    description:
      "The user's todo list. Each task has status: todo | in_progress | done. Use syncTodos to add/update, deleteTodo (requires user confirmation), clearCompletedTodos (removes done), or clearTodos.",
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "syncTodos",
    description:
      "Add or update todos. Set status to todo, in_progress, or done. Cannot delete — use deleteTodo, clearCompletedTodos, or clearTodos.",
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
      description: "Remove all tasks with status done",
      parameters: clearTodosSchema,
      handler: async () => {
        const n = todos.filter((t) => t.status === "done").length;
        handleClearCompletedTodos();
        return n > 0 ? `Removed ${n} completed todo(s).` : "Nothing to remove.";
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

  useHumanInTheLoop(
    {
      name: "deleteTodo",
      description:
        "Request deletion of a single todo by id. The user must confirm before it is removed.",
      parameters: deleteTodoSchema,
      render: (props) => (
        <DeleteConfirmation
          status={props.status}
          todoId={props.args.id ?? ""}
          todos={todos}
          result={props.result}
          respond={props.respond}
          onConfirmDelete={handleDeleteTodo}
        />
      ),
    },
    [todos, handleDeleteTodo]
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
    handleCycleStatus,
    handleDeleteTodo,
    handleClearTodos,
    handleClearCompletedTodos,
  };
};
