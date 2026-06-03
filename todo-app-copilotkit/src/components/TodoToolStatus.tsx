"use client";

import type { TodoToolStatusProps } from "@/types";

const Spinner = () => {
  return (
    <span
      className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
};

const shells = {
  inProgress:
    "flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900",
  executing:
    "flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900",
  complete:
    "flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900",
} as const;

export const TodoToolStatus = ({
  status,
  result,
  labels,
}: TodoToolStatusProps) => {
  if (status === "inProgress") {
    return (
      <div className={shells.inProgress}>
        <Spinner />
        <span>{labels.inProgress}</span>
      </div>
    );
  }

  if (status === "executing") {
    return (
      <div className={shells.executing}>
        <Spinner />
        <span>{labels.executing}</span>
      </div>
    );
  }

  const text =
    labels.complete ?? (result && result.trim() !== "" ? result : "Done.");

  return (
    <div className={shells.complete}>
      <span className="text-base leading-none" aria-hidden>
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
};
