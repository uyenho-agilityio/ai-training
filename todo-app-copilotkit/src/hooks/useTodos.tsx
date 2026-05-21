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
import { parseIsoDate, todayIsoDate } from "@/utils";
import type {
  Todo,
  TodoItem,
  TodoStatus,
  TodoToolRenderProps,
  UpdatedTodoItem,
} from "@/types";

const nextStatus: (s: TodoStatus) => TodoStatus = (s) =>
  s === "todo" ? "in_progress" : s === "in_progress" ? "done" : "todo";

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
        startDate: todayIsoDate(),
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
        prev.map((todo) => {
          if (todo.id !== id) return todo;

          const next: Todo = { ...todo };
          if (fields.text !== undefined) next.text = fields.text;
          if (fields.status !== undefined) next.status = fields.status;
          if (fields.taskNumber !== undefined)
            next.taskNumber = fields.taskNumber;

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
        })
      );
    },
    []
  );

  const handleUpdateTodos = useCallback((items: UpdatedTodoItem[]) => {
    setTodos((prev) => {
      const prevIds = new Set(prev.map((t) => t.id));
      const next = mergeSyncItems(prev, items, nextTaskNumber);
      const addedCount = next.filter((t) => !prevIds.has(t.id)).length;
      if (addedCount > 0) {
        queueMicrotask(() => onNewSyncRef.current?.());
      }
      return next;
    });
  }, []);

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
      "The user's todo list. Each task has id, status (todo | in_progress | done), optional startDate and dueDate (YYYY-MM-DD). When updating, reuse the exact id from this list. Use syncTodos to add/update, deleteTodo (requires user confirmation), clearCompletedTodos (removes done), or clearTodos.",
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "syncTodos",
    description:
      "Add or update todos by id from context. Set status to todo, in_progress, or done. Optional startDate (YYYY-MM-DD). Only set dueDate when the user explicitly asks; use strict YYYY-MM-DD (e.g. 2026-05-25). When updating one task, send only that item with its existing id — do not invent ids. Omit dueDate on tasks you are not changing. Cannot delete — use deleteTodo, clearCompletedTodos, or clearTodos.",
    parameters: todosSchema,
    handler: async ({ items }) => {
      handleUpdateTodos(items);
      return "Done.";
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
        handleClearTodos();
        return "Cleared all todos.";
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
        handleClearCompletedTodos();
        return "Cleared completed todos.";
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
