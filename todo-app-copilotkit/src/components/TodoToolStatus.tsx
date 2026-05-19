"use client";

import type { TodoToolStatusProps } from "@/types";

const Spinner = () => (
  <span
    className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    aria-hidden
  />
);

const resolveLabel = (
  label: string | ((value: string) => string) | undefined,
  value: string,
  fallback: string
) => {
  if (!label) return fallback;
  return typeof label === "function" ? label(value) : label;
};

export const TodoToolStatus = ({
  status,
  args,
  result,
  labels,
}: TodoToolStatusProps) => {
  if (status === "inProgress") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <Spinner />
        <span>{labels.inProgress}</span>
      </div>
    );
  }

  if (status === "executing") {
    const text =
      typeof labels.executing === "function"
        ? labels.executing(args)
        : labels.executing;

    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
        <Spinner />
        <span>{text}</span>
      </div>
    );
  }

  const text = resolveLabel(labels.complete, result ?? "", result ?? "Done.");

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
      <span className="text-base leading-none" aria-hidden>
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
};
