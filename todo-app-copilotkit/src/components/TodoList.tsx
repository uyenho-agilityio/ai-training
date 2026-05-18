import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

import { INITIAL_TODOS } from "@/constants";
import { Todo } from "@/types";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const [input, setInput] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const nextTaskNumber = useRef(INITIAL_TODOS.length + 1);

  useCopilotReadable({
    description: "The user's todo list.",
    value: todos,
  });

  useCopilotAction({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: [
      {
        name: "items",
        type: "object[]",
        description: "The new and updated todo list items.",
        attributes: [
          {
            name: "id",
            type: "string",
            description:
              "The id of the todo item. When creating a new todo item, just make up a new id.",
          },
          {
            name: "text",
            type: "string",
            description: "The text of the todo item.",
          },
          {
            name: "isCompleted",
            type: "boolean",
            description: "The completion status of the todo item.",
          },
          {
            name: "taskNumber",
            type: "number",
            description:
              "Display number for TASK-N label. When creating new items, use the next available number.",
          },
        ],
      },
    ],
    handler: ({ items }) => {
      const newTodos = [...todos];
      for (const item of items) {
        const existingItemIndex = newTodos.findIndex(
          (todo) => todo.id === item.id
        );
        if (existingItemIndex !== -1) {
          newTodos[existingItemIndex] = {
            ...newTodos[existingItemIndex],
            ...item,
            taskNumber:
              item.taskNumber ?? newTodos[existingItemIndex].taskNumber,
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
      setTodos(newTodos);
    },
    render: "Updating the todo list...",
  });

  useCopilotAction({
    name: "deleteTodo",
    description: "Delete a todo item",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "The id of the todo item to delete.",
      },
    ],
    handler: ({ id }) => {
      setTodos(todos.filter((todo) => todo.id !== id));
    },
    render: "Deleting a todo item...",
  });

  const addTodo = useCallback(() => {
    if (input.trim() === "") return;

    const taskNumber = nextTaskNumber.current;
    nextTaskNumber.current += 1;

    setTodos([
      ...todos,
      {
        id: nanoid(),
        text: input.trim(),
        isCompleted: false,
        taskNumber,
      },
    ]);
    setInput("");
  }, [input, todos, setTodos, setInput]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") addTodo();
    },
    [addTodo]
  );

  const handleToggleComplete = useCallback(
    (id: string) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        )
      );
    },
    [setTodos, todos]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setTodos(todos.filter((todo) => todo.id !== id));
    },
    [setTodos, todos]
  );

  const hasInput = input.trim().length > 0;

  return (
    <div>
      <div className="todos-form">
        <input
          className="todos-input"
          placeholder="Add a new todo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          type="button"
          className={`todos-add-btn${hasInput ? " todos-add-btn--active" : ""}`}
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      {todos.length > 0 && (
        <ul className="todos-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              item={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
