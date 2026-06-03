"use client";

import {
  useAgentContext,
  useFrontendTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { useCallback, useEffect, useRef, useState } from "react";

import { DeleteConfirmation, TodoToolStatus } from "@/components";
import { clearTodosSchema, deleteTodoSchema, todosSchema } from "@/schemas";
import { useTodosStore } from "@/stores";
import type { TodoToolRenderProps } from "@/types";

export const useTodos = (options?: { onNewTasksFromSync?: () => void }) => {
  const onNewSyncRef = useRef(options?.onNewTasksFromSync);
  const [input, setInput] = useState("");
  const todos = useTodosStore((s) => s.todos);
  const addTodo = useTodosStore((s) => s.addTodo);
  const updateTodo = useTodosStore((s) => s.updateTodo);
  const cycleStatus = useTodosStore((s) => s.cycleStatus);
  const deleteTodo = useTodosStore((s) => s.deleteTodo);
  const clearCompletedTodos = useTodosStore((s) => s.clearCompletedTodos);

  useEffect(() => {
    onNewSyncRef.current = options?.onNewTasksFromSync;
  }, [options?.onNewTasksFromSync]);

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
      const added = useTodosStore.getState().syncTodos(items, replaceAll);
      if (added > 0) {
        queueMicrotask(() => onNewSyncRef.current?.());
      }
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

  useFrontendTool({
    name: "clearTodos",
    description:
      "Remove every todo from the list. Use when the user wants to clear all, reset, or start a fresh list.",
    parameters: clearTodosSchema,
    handler: async () => {
      const count = useTodosStore.getState().todos.length;
      useTodosStore.getState().clearTodos();
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
  });

  useFrontendTool({
    name: "clearCompletedTodos",
    description: "Remove all tasks with status done",
    parameters: clearTodosSchema,
    handler: async () => {
      const completedCount = useTodosStore
        .getState()
        .todos.filter((t) => t.status === "done").length;
      useTodosStore.getState().clearCompletedTodos();
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
  });

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
          onConfirmDelete={deleteTodo}
        />
      ),
    },
    [todos, deleteTodo]
  );

  const handleAddTodo = useCallback((text: string) => addTodo(text), [addTodo]);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleAddTodo(input);
      setInput("");
    },
    [input, handleAddTodo]
  );

  return {
    todos,
    input,
    hasInput: input.trim().length > 0,
    setInput,
    handleSubmit,
    handleAddTodo,
    handleUpdateTodo: updateTodo,
    handleCycleStatus: cycleStatus,
    handleDeleteTodo: deleteTodo,
    handleClearCompletedTodos: clearCompletedTodos,
  };
};
