"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTodoSuggestions, useTodos } from "@/hooks";
import { TodoItem } from "./TodoItem";

export const TodoList = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNotifyTaskAdded = useCallback(() => {
    setShowSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
      successTimerRef.current = null;
    }, 2500);
  }, []);

  const {
    todos,
    input,
    hasInput,
    setInput,
    handleSubmit,
    handleUpdateTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleClearCompletedTodos,
  } = useTodos({ onNewTasksFromSync: handleNotifyTaskAdded });

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

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    const text = input.trim().length > 0;
    handleSubmit(e);
    if (!text) return;
    handleNotifyTaskAdded();
  };

  return (
    <div>
      <form className="todos-form" onSubmit={handleFormSubmit}>
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

      {showSuccess && (
        <div
          className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Task added successfully.
        </div>
      )}

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
