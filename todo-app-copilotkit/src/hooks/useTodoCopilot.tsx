"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";

import { deleteTodoSchema, todosSchema } from "@/schemas";
import type { Todo, UpdatedTodoItem } from "@/types";

type UseTodoCopilotOptions = {
  todos: Todo[];
  handleUpdateTodos: (items: UpdatedTodoItem[]) => void;
  handleDeleteTodo: (id: string) => void;
};

export const useTodoCopilot = ({
  todos,
  handleUpdateTodos,
  handleDeleteTodo,
}: UseTodoCopilotOptions) => {
  useAgentContext({
    description: "The user's todo list.",
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "syncTodos",
    description: "Add, update, or mark todos complete/incomplete",
    parameters: todosSchema,
    handler: async ({ items }) => {
      handleUpdateTodos(items);
    },
    render: () => <span>Syncing todos...</span>,
  });

  useFrontendTool({
    name: "deleteTodo",
    description: "Delete a todo item by id",
    parameters: deleteTodoSchema,
    handler: async ({ id }) => {
      handleDeleteTodo(id);
    },
    render: () => <span>Deleting a todo item...</span>,
  });
};
