"use client";

import { useMemo } from "react";

import { useTodoCopilot, useTodoSuggestions, useTodos } from "@/hooks";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const {
    todos,
    input,
    hasInput,
    setInput,
    handleSubmit,
    handleUpdateTodo,
    handleUpdateTodos,
    handleToggleTodo,
    handleDeleteTodo,
    handleClearTodos,
    handleClearCompletedTodos,
  } = useTodos();

  useTodoCopilot({
    todos,
    handleUpdateTodos,
    handleDeleteTodo,
    handleClearTodos,
    handleClearCompletedTodos,
  });
  useTodoSuggestions(todos);

  const { activeCount, completedCount } = useMemo(() => {
    let active = 0;
    let completed = 0;
    for (const t of todos) {
      if (t.isCompleted) completed += 1;
      else active += 1;
    }
    return { activeCount: active, completedCount: completed };
  }, [todos]);

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

      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3 gap-x-4 text-sm text-neutral-600"
        aria-live="polite"
      >
        <div className="flex flex-wrap gap-4">
          <span>
            <strong className="font-bold text-neutral-900">
              {activeCount}
            </strong>{" "}
            active
          </span>
          <span>
            <strong className="font-bold text-neutral-900">
              {completedCount}
            </strong>{" "}
            completed
          </span>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!completedCount}
          onClick={handleClearCompletedTodos}
        >
          Clear completed
        </button>
      </div>

      {todos.length > 0 ? (
        <ul className="todos-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              item={todo}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
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
