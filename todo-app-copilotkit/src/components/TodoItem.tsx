import { Todo } from "../types";
import { useCallback } from "react";

interface TodoItemProps {
  item: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = ({
  item,
  onToggleComplete,
  onDelete,
}: TodoItemProps) => {
  const handleToggle = useCallback(() => {
    onToggleComplete(item.id);
  }, [onToggleComplete, item.id]);

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDelete(item.id);
    },
    [onDelete, item.id]
  );

  return (
    <li className="todo-item">
      <label className="todo-item__checkbox-wrap">
        <input
          type="checkbox"
          className="todo-item__checkbox"
          checked={item.isCompleted}
          onChange={handleToggle}
        />
        <span className="todo-item__checkbox-ui" aria-hidden="true">
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        </span>
      </label>

      <span
        className={`todo-item__id${item.isCompleted ? " todo-item__id--done" : ""}`}
      >
        TASK-{item.taskNumber}
      </span>

      <span
        className={`todo-item__text${item.isCompleted ? " todo-item__text--done" : ""}`}
      >
        {item.text}
      </span>

      <button
        type="button"
        className="todo-item__delete"
        aria-label={`Delete TASK-${item.taskNumber}`}
        onClick={handleDelete}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
    </li>
  );
};
