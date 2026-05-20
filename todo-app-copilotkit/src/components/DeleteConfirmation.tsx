"use client";

import { ConfirmationModal } from "./ConfirmationModal";
import { TodoToolStatus } from "./TodoToolStatus";
import type { Todo } from "@/types";

type DeleteConfirmationProps = {
  status: "inProgress" | "executing" | "complete";
  todoId: string;
  todos: Todo[];
  result?: string;
  respond?: (result: unknown) => Promise<void>;
  onConfirmDelete: (id: string) => void;
};

const formatTaskLabel = (todo: Todo | undefined, id: string) => {
  if (!todo) return `Task ${id}`;
  return `TASK-${todo.taskNumber}: ${todo.text}`;
};

export const DeleteConfirmation = ({
  status,
  todoId,
  todos,
  result,
  respond,
  onConfirmDelete,
}: DeleteConfirmationProps) => {
  const todo = todos.find((t) => t.id === todoId);
  const label = formatTaskLabel(todo, todoId);

  if (status === "inProgress") {
    return (
      <TodoToolStatus
        status="inProgress"
        args={{ id: todoId }}
        labels={{
          inProgress: "Preparing delete request…",
          executing: "Waiting for your confirmation…",
        }}
      />
    );
  }

  if (status === "complete") {
    return (
      <TodoToolStatus
        status="complete"
        args={{ id: todoId }}
        result={result}
        labels={{
          inProgress: "",
          executing: "",
          complete: result?.includes("cancelled")
            ? "Delete cancelled."
            : "Task deleted.",
        }}
      />
    );
  }

  const onConfirm = () => {
    onConfirmDelete(todoId);
    void respond?.("Deleted todo.");
  };

  const onCancel = () => {
    void respond?.("Deletion cancelled by user.");
  };

  return (
    <ConfirmationModal
      open
      variant="inline"
      title="Delete this task?"
      message={`The assistant wants to remove "${label}". This cannot be undone.`}
      confirmLabel="Delete task"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
