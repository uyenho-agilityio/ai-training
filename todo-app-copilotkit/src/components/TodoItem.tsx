"use client";

import { useCallback, useMemo, useState } from "react";

import { CalendarIcon, ClockIcon, DeleteIcon, EditIcon } from "@/icons";
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
              <EditIcon />
            </button>
          )}

          <button
            type="button"
            className={iconBtnClass}
            aria-label={`Delete TASK-${item.taskNumber}`}
            onClick={onDeleteClick}
          >
            <DeleteIcon />
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
