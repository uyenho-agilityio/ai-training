"use client";

import { useTodoCopilot, useTodos } from "@/hooks";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const {
    todos,
    setTodos,
    nextTaskNumber,
    input,
    setInput,
    hasInput,
    handleSubmit,
    handleToggleComplete,
    handleDeleteTodo,
  } = useTodos();

  useTodoCopilot({ todos, setTodos, nextTaskNumber });

  return (
    <div>
      <form className="todos-form" onSubmit={handleSubmit}>
        <input
          className="todos-input"
          placeholder="Add a new todo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className={`todos-add-btn${hasInput ? " todos-add-btn--active" : ""}`}
        >
          Add
        </button>
      </form>

      {todos.length > 0 ? (
        <ul className="todos-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              item={todo}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      ) : (
        <p>No todos yet. Add one to get started.</p>
      )}
    </div>
  );
};
