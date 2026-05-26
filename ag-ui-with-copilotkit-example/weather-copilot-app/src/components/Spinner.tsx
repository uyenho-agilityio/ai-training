type SpinnerProps = {
  className?: string;
  label?: string;
};

export const Spinner = ({
  className = "",
  label = "Loading",
}: SpinnerProps) => (
  <div
    role="status"
    aria-label={label}
    className={`flex flex-col items-center gap-3 ${className}`}
  >
    <span
      className="size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-sky-500"
      aria-hidden
    />
    <span className="sr-only">{label}</span>
  </div>
);
