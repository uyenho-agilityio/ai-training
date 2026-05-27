"use client";

type ConfirmationModalProps = {
  title: string;
  message: string;
  location: string;
  onApprove: () => void;
  onCancel: () => void;
};

export const ConfirmationModal = ({
  title,
  message,
  location,
  onApprove,
  onCancel,
}: ConfirmationModalProps) => (
  <div
    className="weather-card-root w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    role="dialog"
    aria-labelledby="confirmation-title"
    aria-describedby="confirmation-message"
  >
    <div className="border-b border-slate-100 bg-linear-to-r from-sky-50 to-indigo-50 px-4 py-3">
      <h4
        id="confirmation-title"
        className="text-sm font-bold text-gradient-label"
      >
        {title}
      </h4>
      <p
        id="confirmation-message"
        className="mt-1 text-xs leading-relaxed text-slate-600"
      >
        {message}
      </p>
    </div>

    <div className="px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Location
      </p>
      <p className="mt-1 bg-linear-to-r from-sky-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
        {location}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="flex-1 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
);
