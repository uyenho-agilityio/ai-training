"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type CalendarModalProps = {
  open: boolean;
  title: string;
  value?: string;
  isRequired?: boolean;
  onClose: () => void;
  onSave: (value: string | undefined) => void;
};

type CalendarModalPanelProps = Omit<CalendarModalProps, "open">;

const CalendarModalPanel = ({
  title,
  value,
  isRequired = false,
  onClose,
  onSave,
}: CalendarModalPanelProps) => {
  const titleId = useId();
  const [draft, setDraft] = useState(value ?? "");
  const [touched, setTouched] = useState(false);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const onClear = () => {
    onSave(undefined);
    onClose();
  };

  const onApply = () => {
    if (isRequired && !touched && !value) {
      onClose();
      return;
    }
    onSave(draft.trim() === "" ? undefined : draft);
    onClose();
  };

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-neutral-900">
          {title}
        </h2>

        <label className="mt-4 block">
          <span className="sr-only">Date</span>
          <input
            type="date"
            className={[
              "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400",
              draft
                ? "text-neutral-900"
                : "text-neutral-400 [&::-webkit-datetime-edit-day-field]:text-neutral-400 [&::-webkit-datetime-edit-month-field]:text-neutral-400 [&::-webkit-datetime-edit-year-field]:text-neutral-400 [&::-webkit-datetime-edit-text]:text-neutral-400",
            ].join(" ")}
            value={draft}
            onChange={(e) => {
              setTouched(true);
              setDraft(e.target.value);
            }}
          />
        </label>

        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            onClick={onClear}
          >
            Clear date
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-md border border-blue-300 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              onClick={onApply}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return dialog;
  return createPortal(dialog, document.body);
};

export const CalendarModal = ({
  open,
  title,
  value,
  isRequired,
  onClose,
  onSave,
}: CalendarModalProps) => {
  if (!open) return null;

  return (
    <CalendarModalPanel
      key={`${title}-${value ?? ""}-${isRequired ? "pick" : "optional"}`}
      title={title}
      value={value}
      isRequired={isRequired}
      onClose={onClose}
      onSave={onSave}
    />
  );
};
