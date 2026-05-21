"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export type ApiKeyModalProps = {
  apiKey: string;
  hasApiKey: boolean;
  maskApiKey: (apiKey: string) => string;
  onSave: (apiKey: string) => void;
};

type ApiKeyModalPanelProps = {
  maskedSavedKey?: string;
  onClose: () => void;
  onSave: (apiKey: string) => void;
};

const ApiKeyModalPanel = ({
  maskedSavedKey,
  onClose,
  onSave,
}: ApiKeyModalPanelProps) => {
  const titleId = useId();
  const [draft, setDraft] = useState("");

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

  const onApply = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setDraft("");
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
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-neutral-900">
          OpenAI API key
        </h2>

        {maskedSavedKey && (
          <p className="mt-3 font-mono text-xs text-emerald-800">
            Current: {maskedSavedKey}
          </p>
        )}

        <label className="mt-4 block">
          <span className="sr-only">OpenAI API key</span>
          <input
            type="password"
            className="todos-input w-full font-mono text-xs"
            placeholder="sk-..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-blue-300 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!draft.trim()}
            onClick={onApply}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return dialog;
  return createPortal(dialog, document.body);
};

export const ApiKeyModal = ({
  apiKey,
  hasApiKey,
  maskApiKey,
  onSave,
}: ApiKeyModalProps) => {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(
    (key: string) => {
      onSave(key);
    },
    [onSave]
  );

  const maskedSavedKey = hasApiKey ? maskApiKey(apiKey) : undefined;

  return (
    <>
      <button
        type="button"
        className={[
          "shrink-0 cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
          hasApiKey
            ? "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-200"
            : "border-orange-400 bg-orange-500 text-white hover:bg-orange-600",
        ].join(" ")}
        onClick={openModal}
      >
        {`${hasApiKey ? "Change" : "Add"} Key`}
      </button>

      {open && (
        <ApiKeyModalPanel
          key={maskedSavedKey ?? "new"}
          maskedSavedKey={maskedSavedKey}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  );
};
