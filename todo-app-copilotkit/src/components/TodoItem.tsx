"use client";

import { useCallback, useMemo, useState } from "react";

import type { Todo, TodoItem as TodoItemType, TodoStatus } from "@/types";
import { ConfirmationModal } from "./ConfirmationModal";

type TodoItemProps = {
  item: Todo;
  onCycleStatus: (id: string) => void;
  onUpdate: (id: string, fields: Partial<TodoItemType>) => void;
  onDelete: (id: string) => void;
};

const label: Record<TodoStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const badgeClass: Record<TodoStatus, string> = {
  todo: "border-neutral-300 bg-neutral-100 text-neutral-700",
  in_progress: "border-amber-300 bg-amber-50 text-amber-900",
  done: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

export const TodoItem = ({
  item,
  onUpdate,
  onDelete,
  onCycleStatus,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const isDone = item.status === "done";

  const shell = useMemo(
    () =>
      `inline-flex w-24 shrink-0 cursor-pointer items-center justify-center rounded border px-2 py-0.5 text-center text-xs font-medium transition-opacity hover:opacity-90 ${badgeClass[item.status]}`,
    [item.status]
  );

  const onCycle = useCallback(
    () => onCycleStatus(item.id),
    [onCycleStatus, item.id]
  );

  const onDeleteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setConfirmDeleteOpen(true);
    },
    []
  );

  const onConfirmDelete = useCallback(() => {
    onDelete(item.id);
    setConfirmDeleteOpen(false);
  }, [onDelete, item.id]);

  const onCancelDelete = useCallback(() => {
    setConfirmDeleteOpen(false);
  }, []);

  const onEdit = useCallback(() => {
    if (isDone) return;
    setDraft(item.text);
    setIsEditing(true);
  }, [isDone, item.text]);

  const onSave = useCallback(() => {
    const text = draft.trim();
    if (text) onUpdate(item.id, { text });
    setIsEditing(false);
  }, [draft, item.id, onUpdate]);

  return (
    <li className="todo-item">
      <button
        type="button"
        className={shell}
        title="Change status"
        onClick={onCycle}
      >
        {label[item.status]}
      </button>

      <span className={`todo-item__id${isDone ? " todo-item__id--done" : ""}`}>
        TASK-{item.taskNumber}
      </span>

      {isEditing ? (
        <input
          className="todo-item__edit-input"
          value={draft}
          autoFocus
          aria-label={`Edit TASK-${item.taskNumber}`}
          onBlur={onSave}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span
          className={`todo-item__text${isDone ? " todo-item__text--done" : ""}`}
        >
          {item.text}
        </span>
      )}

      {!isDone && !isEditing && (
        <button
          type="button"
          className="todo-item__edit"
          aria-label={`Edit TASK-${item.taskNumber}`}
          onClick={onEdit}
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
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>
      )}

      <button
        type="button"
        className="todo-item__delete"
        aria-label={`Delete TASK-${item.taskNumber}`}
        onClick={onDeleteClick}
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

      <ConfirmationModal
        open={confirmDeleteOpen}
        title="Delete this task?"
        message={`Remove TASK-${item.taskNumber} (“${item.text}”)? This cannot be undone.`}
        confirmLabel="Delete task"
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </li>
  );
};
