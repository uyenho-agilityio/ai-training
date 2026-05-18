import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";

import { INITIAL_TODOS } from "@/constants";
import { Todo } from "@/types";

export const useTodos = () => {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const nextTaskNumber = useRef(INITIAL_TODOS.length + 1);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (text === "") return;

    const taskNumber = nextTaskNumber.current;
    nextTaskNumber.current += 1;

    setTodos((prev) => [
      ...prev,
      {
        id: nanoid(),
        text,
        isCompleted: false,
        taskNumber,
      },
    ]);
    setInput("");
  }, [input]);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      addTodo();
    },
    [addTodo]
  );

  const handleToggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return {
    todos,
    setTodos,
    nextTaskNumber,
    input,
    setInput,
    hasInput: input.trim().length > 0,
    handleSubmit,
    handleToggleComplete,
    handleDeleteTodo,
  };
};
