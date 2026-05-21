"use client";

import {
  useAgentContext,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
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
import { useTodosStore } from "@/stores";

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
  const todos = useTodosStore((s) => s.todos);
  const setTodos = useTodosStore((s) => s.setTodos);
  const nextTaskNumber = useRef(useTodosStore.getState().nextTaskNumber);

  useEffect(() => {
    const maxTask = todos.reduce((max, t) => Math.max(max, t.taskNumber), 0);
    const next = todos.length === 0 ? 1 : Math.max(maxTask + 1, 1);
    nextTaskNumber.current = next;
    useTodosStore.getState().setNextTaskNumber(next);
  }, [todos]);

  const handleAddTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "") return;

      const taskNumber = nextTaskNumber.current;
      nextTaskNumber.current += 1;

      setTodos((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: trimmed,
          status: "todo",
          taskNumber,
          startDate: todayIsoDate(),
        },
      ]);
      useTodosStore.getState().setNextTaskNumber(nextTaskNumber.current);
    },
    [setTodos]
  );

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
    [setTodos]
  );

  const handleUpdateTodos = useCallback(
    (items: UpdatedTodoItem[], replaceAll?: boolean) => {
      setTodos((prev) => {
        const base = replaceAll ? [] : prev;
        const prevIds = new Set(base.map((t) => t.id));
        const counter = { current: nextTaskNumber.current };
        const next = mergeSyncItems(base, items, counter);
        nextTaskNumber.current = counter.current;
        useTodosStore.getState().setNextTaskNumber(counter.current);

        const addedCount = next.filter((t) => !prevIds.has(t.id)).length;
        if (addedCount > 0) {
          queueMicrotask(() => onNewSyncRef.current?.());
        }
        return next;
      });
    },
    [setTodos]
  );

  const handleCycleStatus = useCallback(
    (id: string) => {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: nextStatus(t.status) } : t
        )
      );
    },
    [setTodos]
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    },
    [setTodos]
  );

  const handleClearTodos = useCallback(() => {
    useTodosStore.getState().resetTodos();
    nextTaskNumber.current = 1;
  }, []);

  const handleClearCompletedTodos = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => todo.status !== "done"));
  }, [setTodos]);

  useAgentContext({
    description: `ONLY source of truth for the todo UI (${todos.length} task(s)). The left panel shows exactly this JSON — not chat history. When listing todos, read only this data. To add or change tasks you MUST call syncTodos (each new task needs a unique id and non-empty text). Reuse existing ids when updating. Tools: syncTodos, deleteTodo (confirmation), clearCompletedTodos, clearTodos.`,
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "syncTodos",
    description:
      "Add or update todos in the UI. Each item needs id + text for new tasks (unique ids). Set status: todo | in_progress | done. Optional startDate (YYYY-MM-DD). Only set dueDate when the user asks (YYYY-MM-DD). When updating one task, send only that item with its existing id from context. To add multiple tasks at once, include every task in items[]. Set replaceAll: true only when replacing the entire list from context. Cannot delete — use deleteTodo, clearCompletedTodos, or clearTodos.",
    parameters: todosSchema,
    handler: async ({ items, replaceAll }) => {
      handleUpdateTodos(items, replaceAll);
      const count = useTodosStore.getState().todos.length;
      return `Total now: ${count} todo(s).`;
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
    [handleClearTodos, handleUpdateTodos]
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
    [handleClearCompletedTodos]
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
