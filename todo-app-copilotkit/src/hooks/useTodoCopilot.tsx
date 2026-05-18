"use client";

import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { deleteTodoSchema, updateTodoListSchema } from "@/schemas";
import { Todo } from "@/types";

type UseTodoCopilotOptions = {
  todos: Todo[];
  setTodos: Dispatch<SetStateAction<Todo[]>>;
  nextTaskNumber: RefObject<number>;
};

export const useTodoCopilot = ({
  todos,
  setTodos,
  nextTaskNumber,
}: UseTodoCopilotOptions) => {
  useAgentContext({
    description: "The user's todo list.",
    value: JSON.stringify(todos),
  });

  useFrontendTool({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: updateTodoListSchema,
    handler: async ({ items }) => {
      setTodos((prev) => {
        const newTodos = [...prev];
        for (const item of items) {
          const existingIndex = newTodos.findIndex(
            (todo) => todo.id === item.id
          );
          if (existingIndex !== -1) {
            newTodos[existingIndex] = {
              ...newTodos[existingIndex],
              ...item,
              taskNumber: item.taskNumber ?? newTodos[existingIndex].taskNumber,
            };
          } else {
            const taskNumber = item.taskNumber ?? nextTaskNumber.current;
            nextTaskNumber.current = Math.max(
              nextTaskNumber.current,
              taskNumber + 1
            );
            newTodos.push({
              id: item.id,
              text: item.text,
              isCompleted: item.isCompleted ?? false,
              taskNumber,
            });
          }
        }
        return newTodos;
      });
    },
    render: () => <span>Updating the todo list...</span>,
  });

  useFrontendTool({
    name: "deleteTodo",
    description: "Delete a todo item",
    parameters: deleteTodoSchema,
    handler: async ({ id }) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    },
    render: () => <span>Deleting a todo item...</span>,
  });
};
