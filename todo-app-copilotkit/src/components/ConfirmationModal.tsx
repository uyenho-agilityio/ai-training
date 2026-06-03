"use client";

import { useCallback, useEffect, useId } from "react";

type ConfirmationModalProps = {
  variant?: "modal" | "inline";
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmationModal = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "modal",
}: ConfirmationModalProps) => {
  const titleId = useId();
  const descId = useId();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (!open || variant !== "modal") return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, variant, onKeyDown]);

  if (!open) return null;

  const panel = (
    <div
      role="alertdialog"
      aria-modal={variant === "modal" ? true : undefined}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={
        variant === "modal"
          ? "w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-5 shadow-lg"
          : "rounded-lg border border-neutral-200 bg-white p-4"
      }
      onClick={(e) => e.stopPropagation()}
    >
      <h2 id={titleId} className="text-base font-semibold text-neutral-900">
        {title}
      </h2>
      <p id={descId} className="mt-2 text-sm text-neutral-600">
        {message}
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200"
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-md border border-red-300 bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );

  if (variant === "inline") return panel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      {panel}
    </div>
  );
};
