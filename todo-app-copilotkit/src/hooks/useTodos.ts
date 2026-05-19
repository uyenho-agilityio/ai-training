"use client";

import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";

import { INITIAL_TODOS } from "@/constants";
import type { Todo, TodoItem, UpdatedTodoItem } from "@/types";

export const useTodos = () => {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const nextTaskNumber = useRef(INITIAL_TODOS.length + 1);

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

  const handleUpdateTodos = useCallback((items: UpdatedTodoItem[]) => {
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
