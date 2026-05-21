"use client";

import { useCallback, useMemo, useState } from "react";

import {
  formatShortDate,
  isDueHighlighted,
  isOverdue,
  parseIsoDate,
  todayIsoDate,
} from "@/utils";
import type { Todo, TodoItem as TodoItemType, TodoStatus } from "@/types";
import { CalendarModal } from "./CalendarModal";
import { ConfirmationModal } from "./ConfirmationModal";

type TodoItemProps = {
  item: Todo;
  onCycleStatus: (id: string) => void;
  onUpdate: (id: string, fields: Partial<TodoItemType>) => void;
  onDelete: (id: string) => void;
};

type DateField = "startDate" | "dueDate";

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

const dateChipClass =
  "inline-flex cursor-pointer items-center gap-1 rounded px-0.5 text-xs text-neutral-500 transition-colors hover:text-neutral-700";

const iconBtnClass =
  "flex shrink-0 items-center justify-center rounded p-0.5 text-neutral-900 opacity-85 transition-opacity hover:opacity-100";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-3.5 shrink-0"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`size-3.5 shrink-0 ${className ?? ""}`}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

export const TodoItem = ({
  item,
  onUpdate,
  onDelete,
  onCycleStatus,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dateModalField, setDateModalField] = useState<DateField | null>(null);
  const isDone = item.status === "done";
  const overdue = isOverdue(item.dueDate, item.status);
  const dueHighlighted = isDueHighlighted(item.dueDate, item.status);
  const startLabel = formatShortDate(item.startDate);
  const dueLabel = formatShortDate(item.dueDate);
  const dueSuffix = overdue ? " (overdue)" : "";
  const dateModalOpen = dateModalField !== null;

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

  const exitEditing = useCallback(() => {
    setIsEditing(false);
    setDateModalField(null);
  }, []);

  const onEdit = useCallback(() => {
    if (isDone) return;
    if (isEditing) {
      const text = draft.trim();
      if (text) onUpdate(item.id, { text });
      exitEditing();
      return;
    }
    setDraft(item.text);
    setIsEditing(true);
  }, [isDone, isEditing, draft, item.text, item.id, onUpdate, exitEditing]);

  const onSaveText = useCallback(() => {
    if (dateModalOpen) return;
    const text = draft.trim();
    if (text) onUpdate(item.id, { text });
    setIsEditing(false);
  }, [dateModalOpen, draft, item.id, onUpdate]);

  const onDateSave = useCallback(
    (value: string | undefined) => {
      if (!dateModalField) return;
      onUpdate(item.id, { [dateModalField]: value });
    },
    [dateModalField, item.id, onUpdate]
  );

  const openDateModal = useCallback(
    (field: DateField) => {
      if (isDone) return;
      setDateModalField(field);
    },
    [isDone]
  );

  const dateModalTitle =
    dateModalField === "startDate" ? "Start date" : "Due date";

  const modalValue =
    dateModalField === "startDate"
      ? (parseIsoDate(item.startDate) ?? todayIsoDate())
      : dateModalField === "dueDate"
        ? parseIsoDate(item.dueDate)
        : undefined;

  const renderStartDate = () => {
    if (isDone) {
      if (!startLabel) return null;
      return (
        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
          <CalendarIcon />
          <span>{startLabel}</span>
        </span>
      );
    }
    return (
      <button
        type="button"
        className={dateChipClass}
        aria-label={
          startLabel ? `Start date ${startLabel}, change` : "Set start date"
        }
        onClick={() => openDateModal("startDate")}
      >
        <CalendarIcon />
        <span>{startLabel ?? "Set start"}</span>
      </button>
    );
  };

  const renderDueDate = () => {
    if (isDone) {
      if (!dueLabel) return null;
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs${dueHighlighted ? " text-red-600" : " text-neutral-400"}`}
        >
          <ClockIcon className={dueHighlighted ? "text-red-600" : undefined} />
          <span>
            {dueLabel}
            {dueSuffix}
          </span>
        </span>
      );
    }
    return (
      <button
        type="button"
        className={`${dateChipClass}${dueHighlighted ? " text-red-600 hover:text-red-700" : ""}`}
        aria-label={
          dueLabel ? `Due date ${dueLabel}${dueSuffix}, change` : "Set due date"
        }
        onClick={() => openDateModal("dueDate")}
      >
        <ClockIcon className={dueHighlighted ? "text-red-600" : undefined} />
        <span>
          {dueLabel ?? "Set due"}
          {dueLabel ? dueSuffix : ""}
        </span>
      </button>
    );
  };

  const showStart = isDone ? startLabel !== null : true;
  const showDue = isDone ? dueLabel !== null : true;

  return (
    <li className="rounded-lg bg-[var(--todo-item-bg)] px-4 py-4">
      <div className="flex w-full items-start gap-2.5">
        <button
          type="button"
          className={shell}
          title="Change status"
          onClick={onCycle}
        >
          {label[item.status]}
        </button>

        <span
          className={`shrink-0 text-sm font-bold${isDone ? " text-[var(--todo-text-done)] line-through" : " text-[var(--todo-text-secondary)]"}`}
        >
          TASK-{item.taskNumber}
        </span>

        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          {isEditing ? (
            <input
              className="w-full min-w-0 rounded border border-neutral-900 bg-white px-2 py-1 text-sm text-[var(--todo-text-secondary)] outline-none focus:border-neutral-900"
              value={draft}
              autoFocus
              aria-label={`Edit TASK-${item.taskNumber}`}
              onBlur={onSaveText}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveText();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  exitEditing();
                }
              }}
            />
          ) : (
            <span
              className={`text-sm${isDone ? " text-[var(--todo-text-done)] line-through" : " text-[var(--todo-text-secondary)]"}`}
            >
              {item.text}
            </span>
          )}

          {(showStart || showDue) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {showStart && renderStartDate()}
              {showStart && showDue && (
                <span
                  className="select-none text-xs text-neutral-400"
                  aria-hidden
                >
                  ·
                </span>
              )}
              {showDue && renderDueDate()}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 self-center">
          {!isDone && (
            <button
              type="button"
              className={`${iconBtnClass}${isEditing ? " text-blue-600 opacity-100" : ""}`}
              aria-label={
                isEditing
                  ? `Save edits for TASK-${item.taskNumber}`
                  : `Edit TASK-${item.taskNumber}`
              }
              aria-pressed={isEditing}
              onClick={onEdit}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-[1.125rem]"
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
            className={iconBtnClass}
            aria-label={`Delete TASK-${item.taskNumber}`}
            onClick={onDeleteClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-[1.125rem]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      <CalendarModal
        open={dateModalOpen}
        title={dateModalTitle}
        value={modalValue}
        isRequired={dateModalField === "dueDate" && !item.dueDate}
        onClose={() => setDateModalField(null)}
        onSave={onDateSave}
      />

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
