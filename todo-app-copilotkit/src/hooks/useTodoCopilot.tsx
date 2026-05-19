"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";

import type { Todo, TodoToolRenderProps, UpdatedTodoItem } from "@/types";
import { clearTodosSchema, deleteTodoSchema, todosSchema } from "@/schemas";
import { TodoToolStatus } from "@/components/TodoToolStatus";

type UseTodoCopilotOptions = {
  todos: Todo[];
  handleUpdateTodos: (items: UpdatedTodoItem[]) => void;
  handleDeleteTodo: (id: string) => void;
  handleClearTodos: () => void;
  handleClearCompletedTodos: () => void;
};

export const useTodoCopilot = ({
  todos,
  handleUpdateTodos,
  handleDeleteTodo,
  handleClearTodos,
  handleClearCompletedTodos,
}: UseTodoCopilotOptions) => {
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
          executing: (args) => {
            const items = args.items;
            const count = Array.isArray(items) ? items.length : 0;
            return count > 0
              ? `Updating ${count} todo(s)…`
              : "Applying todo changes…";
          },
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
          executing: () => "Deleting todo…",
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
          executing: () => "Clearing all todos…",
        }}
      />
    ),
  });

  useFrontendTool({
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
          executing: () => "Removing completed todos…",
        }}
      />
    ),
  });
};
